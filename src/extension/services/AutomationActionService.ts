/*
 * ipl-overlay-controls contains a "Game automation actions" module.
 * Each action has a list of pre-defined "Tasks" that it completes in a pre-defined order, each one at its own time.
 */

import type NodeCG from '@nodecg/types';
import { GameAutomationData, RuntimeConfig, ScoreboardData } from 'schemas';
import { GameVersion } from 'types/enums/gameVersion';
import { GameAutomationAction } from 'types/enums/GameAutomationAction';
import { switchToNextColor } from '../replicants/activeRound';
import { ObsConnectorService } from './ObsConnectorService';
import * as util from 'util';
import i18next from 'i18next';

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
        showScoreboard: 14000,
        showCasters: 10000
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
    private scoreboardData: NodeCG.ServerReplicant<ScoreboardData>;
    private runtimeConfig: NodeCG.ServerReplicant<RuntimeConfig>;
    private gameAutomationData: NodeCG.ServerReplicant<GameAutomationData>;
    private readonly obsConnectorService: ObsConnectorService;
    private automationTasks: Array<AutomationActionTask> | null;
    private nextAutomationTaskTimeout: NodeJS.Timeout;

    constructor(nodecg: NodeCG.ServerAPI, obsConnectorService: ObsConnectorService) {
        this.nodecg = nodecg;
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
                            const config = this.obsConnectorService.findCurrentConfig();
                            if (config?.gameplayScene != null) {
                                await this.obsConnectorService.setCurrentScene(config.gameplayScene);
                            }
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
                            const config = this.obsConnectorService.findCurrentConfig();
                            if (config?.intermissionScene != null) {
                                await this.obsConnectorService.setCurrentScene(config.intermissionScene);
                            }
                        }
                    }
                ];
            default:
                throw new Error(i18next.t('automationActions.unknownTask', { name: action }));
        }
    }

    startAutomationAction(action: GameAutomationAction): void {
        if (this.gameAutomationData.value.actionInProgress !== GameAutomationAction.NONE) {
            throw new Error(i18next.t('automationActions.actionAlreadyOngoing'));
        }

        this.gameAutomationData.value.actionInProgress = action;
        this.automationTasks = this.getAutomationTasks(action);

        this.queueNextAutomationTask().catch(e => {
            this.nodecg.log.error(i18next.t('automationActions.taskStartFailed'), e);
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
            this.nodecg.log.error(i18next.t('automationActions.errorInTask'), e);
        }
    }

    async fastForwardToNextAutomationTask(): Promise<void> {
        if (this.gameAutomationData.value.actionInProgress === GameAutomationAction.NONE) {
            throw new Error(i18next.t('automationActions.noActionOngoing'));
        }

        await this.completeTimedAutomationTask(
            this.automationTasks[this.gameAutomationData.value.nextTaskForAction.index]);
    }

    cancelAutomationAction(): void {
        if (this.gameAutomationData.value.actionInProgress === GameAutomationAction.NONE) {
            throw new Error(i18next.t('automationActions.noActionOngoing'));
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
