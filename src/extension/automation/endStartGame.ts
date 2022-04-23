/*
 * ipl-overlay-controls contains a "Game automation actions" module.
 * Each action has a list of pre-defined "Tasks" that it completes in a pre-defined order, each one at its own time.
 */

import * as nodecgContext from '../helpers/nodecg';
import { GameAutomationData, ObsData, RuntimeConfig, ScoreboardData } from '../../types/schemas';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import { setCurrentScene } from './obsSocket';
import { GameVersion } from '../../types/enums/gameVersion';
import { switchToNextColor } from '../replicants/activeRound';
import { GameAutomationAction } from '../../types/enums/GameAutomationAction';

const nodecg = nodecgContext.get();

const obsData = nodecg.Replicant<ObsData>('obsData');
const scoreboardData = nodecg.Replicant<ScoreboardData>('scoreboardData');
const runtimeConfig = nodecg.Replicant<RuntimeConfig>('runtimeConfig');
const gameAutomationData = nodecg.Replicant<GameAutomationData>('gameAutomationData');

let automationTasks: Array<AutomationActionTask> | null = null;
let nextAutomationTaskTimeout: NodeJS.Timeout = null;

resetGameAutomationData();

interface AutomationActionTask {
    timeout: number
    name: string
    action: () => unknown
}

interface GameStartTimings {
    showScoreboard: number
    showCasters: number
}

interface GameEndTimings {
    hideScoreboard: number
    changeScene: number
}

const startTimings: Record<GameVersion, GameStartTimings> = {
    [GameVersion.SPLATOON_2]: {
        showScoreboard: 11500,
        showCasters: 12000
    },
    [GameVersion.SPLATOON_3]: {
        showScoreboard: 11500,
        showCasters: 12000
    }
};
const endTimings: Record<GameVersion, GameEndTimings> = {
    [GameVersion.SPLATOON_2]: {
        hideScoreboard: 3000,
        changeScene: 7500
    },
    [GameVersion.SPLATOON_3]: {
        hideScoreboard: 3000,
        changeScene: 7500
    }
};

function getAutomationTasks(action: GameAutomationAction): Array<AutomationActionTask> {
    const gameVersion = runtimeConfig.value.gameVersion;
    switch (action) {
        case GameAutomationAction.START_GAME:
            return [
                {
                    timeout: 0,
                    name: 'changeScene',
                    action: async () => {
                        switchToNextColor();
                        await setCurrentScene(obsData.value.gameplayScene);
                    }
                },
                {
                    timeout: startTimings[gameVersion].showScoreboard,
                    name: 'showScoreboard',
                    action: () => {
                        scoreboardData.value.isVisible = true;
                    }
                },
                {
                    timeout: startTimings[gameVersion].showCasters,
                    name: 'showCasters',
                    action: () => {
                        nodecg.sendMessage('mainShowCasters');
                    }
                }
            ];
        case GameAutomationAction.END_GAME:
            return [
                {
                    timeout: endTimings[gameVersion].hideScoreboard,
                    name: 'hideScoreboard',
                    action: () => {
                        scoreboardData.value.isVisible = false;
                    }
                },
                {
                    timeout: endTimings[gameVersion].changeScene,
                    name: 'changeScene',
                    action: async () => {
                        await setCurrentScene(obsData.value.intermissionScene);
                    }
                }
            ];
        default:
            throw new Error(`Unknown GameAutomationTask value '${action}'`);
    }
}

nodecg.listenFor('startGame', (data: never, ack: UnhandledListenForCb) => {
    try {
        startAutomationAction(GameAutomationAction.START_GAME);
        ack(null);
    } catch (e) {
        return ack(e);
    }
});

nodecg.listenFor('endGame', (data: never, ack: UnhandledListenForCb) => {
    try {
        startAutomationAction(GameAutomationAction.END_GAME);
        ack(null);
    } catch (e) {
        return ack(e);
    }
});

nodecg.listenFor('fastForwardToNextGameAutomationTask', (data: never, ack: UnhandledListenForCb) => {
    if (gameAutomationData.value.actionInProgress === GameAutomationAction.NONE) {
        return ack(new Error('No action is in progress.'));
    }

    completeAutomationTask(automationTasks[gameAutomationData.value.nextTaskForAction.index]);
    ack(null);
});

function startAutomationAction(action: GameAutomationAction): void {
    if (gameAutomationData.value.actionInProgress !== GameAutomationAction.NONE) {
        throw new Error('An action is already in progress.');
    }

    gameAutomationData.value.actionInProgress = action;
    automationTasks = getAutomationTasks(action);

    setNextAutomationTask();
}

async function setNextAutomationTask(): Promise<void> {
    let nextTaskIndex = (gameAutomationData.value.nextTaskForAction?.index ?? -1) + 1;
    let nextTask = automationTasks[nextTaskIndex];
    // Immediately execute tasks with no timeout without sending info about the tasks to clients
    while (nextTask?.timeout === 0) {
        await executeAutomationTask(nextTask);
        nextTaskIndex++;
        nextTask = automationTasks[nextTaskIndex];
    }
    if (!nextTask) {
        resetGameAutomationData();
    } else {
        gameAutomationData.value.nextTaskForAction = {
            index: nextTaskIndex,
            name: nextTask.name,
            executionTimeMillis: new Date().getTime() + nextTask.timeout
        };
        nextAutomationTaskTimeout = setTimeout(async () => {
            await completeAutomationTask(nextTask);
        }, nextTask.timeout);
    }
}

async function completeAutomationTask(task: AutomationActionTask): Promise<void> {
    clearTimeout(nextAutomationTaskTimeout);
    setNextAutomationTask();
    await executeAutomationTask(task);
}

async function executeAutomationTask(task: AutomationActionTask): Promise<void> {
    try {
        const result = task.action();
        if (isPromise(result)) {
            await task.action();
        }
    } catch (e) {
        nodecg.log.error('Encountered an error during automation task', e);
    }
}

function resetGameAutomationData(): void {
    gameAutomationData.value.actionInProgress = GameAutomationAction.NONE;
    gameAutomationData.value.nextTaskForAction = null;
    automationTasks = null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isPromise(value: any): boolean {
    return Boolean(value && typeof value === 'object' && typeof value.then === 'function');
}
