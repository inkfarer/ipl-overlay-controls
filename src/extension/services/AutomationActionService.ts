/*
 * ipl-overlay-controls contains a "Game automation actions" module.
 * Each action has a list of pre-defined "Tasks" that it completes in a pre-defined order, each one at its own time.
 */

import type NodeCG from '@nodecg/types';
import { GameAutomationData, ObsData, RuntimeConfig, ScoreboardData } from 'schemas';
import { GameVersion } from 'types/enums/gameVersion';
import { GameAutomationAction } from 'types/enums/GameAutomationAction';
import { switchToNextColor } from '../replicants/activeRound';
import { ObsConnectorService } from './ObsConnectorService';
import * as util from 'util';

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

export class AutomationActionService {
    private nodecg: NodeCG.ServerAPI;
    private obsData: NodeCG.ServerReplicant<ObsData>;
    private scoreboardData: NodeCG.ServerReplicant<ScoreboardData>;
    private runtimeConfig: NodeCG.ServerReplicant<RuntimeConfig>;
    private gameAutomationData: NodeCG.ServerReplicant<GameAutomationData>;
    private readonly obsConnectorService: ObsConnectorService;
    private automationTasks: Array<AutomationActionTask> | null;
    private nextAutomationTaskTimeout: NodeJS.Timeout;

    constructor(nodecg: NodeCG.ServerAPI, obsConnectorService: ObsConnectorService) {
        this.nodecg = nodecg;
        this.obsData = nodecg.Replicant<ObsData>('obsData');
        this.scoreboardData = nodecg.Replicant<ScoreboardData>('scoreboardData');
        this.runtimeConfig = nodecg.Replicant<RuntimeConfig>('runtimeConfig');
        this.gameAutomationData = nodecg.Replicant<GameAutomationData>('gameAutomationData');
        this.obsConnectorService = obsConnectorService;
        this.automationTasks = null;
    }

    private getAutomationTasks(action: GameAutomationAction): Array<AutomationActionTask> {
        const gameVersion = this.runtimeConfig.value.gameVersion;
        switch (action) {
            case GameAutomationAction.START_GAME:
                return [
                    {
                        timeout: 1000,
                        name: 'changeScene',
                        action: async () => {
                            switchToNextColor();
                            await this.obsConnectorService.setCurrentScene(this.obsData.value.gameplayScene);
                        }
                    },
                    {
                        timeout: startTimings[gameVersion].showScoreboard,
                        name: 'showScoreboard',
                        action: () => {
                            this.scoreboardData.value.isVisible = true;
                        }
                    },
                    {
                        timeout: startTimings[gameVersion].showCasters,
                        name: 'showCasters',
                        action: () => {
                            this.nodecg.sendMessage('mainShowCasters');
                        }
                    }
                ];
            case GameAutomationAction.END_GAME:
                return [
                    {
                        timeout: endTimings[gameVersion].hideScoreboard,
                        name: 'hideScoreboard',
                        action: () => {
                            this.scoreboardData.value.isVisible = false;
                        }
                    },
                    {
                        timeout: endTimings[gameVersion].changeScene,
                        name: 'changeScene',
                        action: async () => {
                            await this.obsConnectorService.setCurrentScene(this.obsData.value.intermissionScene);
                        }
                    }
                ];
            default:
                throw new Error(`Unknown GameAutomationTask value '${action}'`);
        }
    }

    startAutomationAction(action: GameAutomationAction): void {
        if (this.gameAutomationData.value.actionInProgress !== GameAutomationAction.NONE) {
            throw new Error('An action is already in progress.');
        }

        this.gameAutomationData.value.actionInProgress = action;
        this.automationTasks = this.getAutomationTasks(action);

        this.queueNextAutomationTask().catch(e => {
            this.nodecg.log.error('Failed to start automation task:', e.message ?? String(e));
        });
    }

    private async queueNextAutomationTask(): Promise<void> {
        let nextTaskIndex = (this.gameAutomationData.value.nextTaskForAction?.index ?? -1) + 1;
        let nextTask = this.automationTasks[nextTaskIndex];
        // Immediately execute tasks with no timeout without sending info about the tasks to clients
        while (nextTask?.timeout === 0) {
            await this.executeAutomationTask(nextTask);
            nextTaskIndex++;
            nextTask = this.automationTasks[nextTaskIndex];
        }
        if (!nextTask) {
            this.resetGameAutomationData();
        } else {
            this.gameAutomationData.value.nextTaskForAction = {
                index: nextTaskIndex,
                name: nextTask.name,
                executionTimeMillis: new Date().getTime() + nextTask.timeout
            };
            this.nextAutomationTaskTimeout = setTimeout(async () => {
                await this.completeTimedAutomationTask(nextTask);
            }, nextTask.timeout);
        }
    }

    private async completeTimedAutomationTask(task: AutomationActionTask): Promise<void> {
        clearTimeout(this.nextAutomationTaskTimeout);
        await this.executeAutomationTask(task);
        await this.queueNextAutomationTask();
    }

    private async executeAutomationTask(task: AutomationActionTask): Promise<void> {
        try {
            const result = task.action();
            if (util.types.isPromise(result)) {
                await result;
            }
        } catch (e) {
            this.nodecg.log.error('Encountered an error during automation task', e);
        }
    }

    async fastForwardToNextAutomationTask(): Promise<void> {
        if (this.gameAutomationData.value.actionInProgress === GameAutomationAction.NONE) {
            throw new Error('No action is in progress.');
        }

        await this.completeTimedAutomationTask(
            this.automationTasks[this.gameAutomationData.value.nextTaskForAction.index]);
    }

    cancelAutomationAction(): void {
        if (this.gameAutomationData.value.actionInProgress === GameAutomationAction.NONE) {
            throw new Error('No action is in progress.');
        }

        clearTimeout(this.nextAutomationTaskTimeout);
        this.resetGameAutomationData();
    }

    resetGameAutomationData(): void {
        this.gameAutomationData.value.actionInProgress = GameAutomationAction.NONE;
        this.gameAutomationData.value.nextTaskForAction = null;
        this.automationTasks = null;
    }
}
