import { mock } from 'jest-mock-extended';

import * as ActiveRoundModule from '../../replicants/activeRound';
const mockActiveRoundModule = mock<typeof ActiveRoundModule>();
jest.mock('../../replicants/activeRound', () => mockActiveRoundModule);

import { cartesian } from '../../../helpers/ArrayHelper';
import { GameAutomationAction } from '../../../types/enums/GameAutomationAction';
import { GameVersion } from '../../../types/enums/gameVersion';
import { GameAutomationData, ScoreboardData } from '../../../types/schemas';
import { mockNodecg, replicants } from '../../__mocks__/mockNodecg';
import { AutomationActionService } from '../AutomationActionService';
import { ObsConnectorService } from '../ObsConnectorService';

describe('AutomationActionService', () => {
    let obsConnectorService: ObsConnectorService;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.useFakeTimers();
        jest.spyOn(Date.prototype, 'getTime').mockReturnValue(10000);
        replicants.obsData = { gameplayScene: 'Gameplay Scene', intermissionScene: 'Break Scene' };
        replicants.scoreboardData = {};
        replicants.gameAutomationData = {
            actionInProgress: GameAutomationAction.NONE,
            nextTaskForAction: null
        };
        obsConnectorService = mock<ObsConnectorService>();
    });

    afterEach(() => {
        jest.clearAllTimers();
    });

    describe('getAutomationTasks', () => {
        beforeEach(() => {
            replicants.runtimeConfig = {
                gameVersion: GameVersion.SPLATOON_2
            };
        });

        it('returns expected actions for starting a game', async () => {
            replicants.obsData = {
                gameplayScene: 'gameplay scene'
            };
            replicants.scoreboardData = {
                isVisible: false
            };
            const service = new AutomationActionService(mockNodecg, obsConnectorService);

            const result = service['getAutomationTasks'](GameAutomationAction.START_GAME);

            expect(result.length).toEqual(3);

            await result[0].action();
            expect(mockActiveRoundModule.switchToNextColor).toHaveBeenCalled();
            expect(obsConnectorService.setCurrentScene).toHaveBeenCalledWith('gameplay scene');
            expect((replicants.scoreboardData as ScoreboardData).isVisible).toEqual(false);
            expect(mockNodecg.sendMessage).not.toHaveBeenCalled();

            result[1].action();
            expect((replicants.scoreboardData as ScoreboardData).isVisible).toEqual(true);
            expect(mockNodecg.sendMessage).not.toHaveBeenCalled();

            result[2].action();
            expect(mockNodecg.sendMessage).toHaveBeenCalledWith('mainShowCasters');
        });

        it('returns expected actions for ending a game', async () => {
            replicants.obsData = {
                intermissionScene: 'intermission scene'
            };
            replicants.scoreboardData = {
                isVisible: true
            };
            const service = new AutomationActionService(mockNodecg, obsConnectorService);

            const result = service['getAutomationTasks'](GameAutomationAction.END_GAME);

            expect(result.length).toEqual(2);

            result[0].action();
            expect((replicants.scoreboardData as ScoreboardData).isVisible).toEqual(false);
            expect(obsConnectorService.setCurrentScene).not.toHaveBeenCalled();

            await result[1].action();
            expect(obsConnectorService.setCurrentScene).toHaveBeenCalledWith('intermission scene');
        });

        it.each(
            cartesian(Object.values(GameVersion), Object.values(GameAutomationAction))
        )('has expected timings for game version %s and action %s', (version, action) => {
            if (action === GameAutomationAction.NONE) return;

            replicants.runtimeConfig = {
                gameVersion: version
            };

            const service = new AutomationActionService(mockNodecg, obsConnectorService);

            const result = service['getAutomationTasks'](action);

            expect(result).toMatchSnapshot();
        });

        it('throws an error on unknown automation tasks', () => {
            const service = new AutomationActionService(mockNodecg, obsConnectorService);

            // @ts-ignore
            expect(() => service['getAutomationTasks']('asdasdasdasd'))
                .toThrow(new Error('Unknown GameAutomationTask value \'asdasdasdasd\''));
        });
    });

    describe('startAutomationAction', () => {
        it('throws an error if an action is already in progress', () => {
            replicants.gameAutomationData = {
                actionInProgress: GameAutomationAction.START_GAME
            };
            const service = new AutomationActionService(mockNodecg, obsConnectorService);

            expect(() => service.startAutomationAction(GameAutomationAction.END_GAME))
                .toThrow(new Error('An action is already in progress.'));
        });

        it('updates automation data and starts the specified action', () => {
            replicants.gameAutomationData = {
                actionInProgress: GameAutomationAction.NONE
            };
            jest.spyOn(AutomationActionService.prototype as any, 'getAutomationTasks')
                .mockReturnValue('test automation tasks');
            jest.spyOn(AutomationActionService.prototype as any, 'queueNextAutomationTask').mockResolvedValue(null);
            const service = new AutomationActionService(mockNodecg, obsConnectorService);

            service.startAutomationAction(GameAutomationAction.START_GAME);

            expect((replicants.gameAutomationData as GameAutomationData).actionInProgress)
                .toEqual(GameAutomationAction.START_GAME);
            expect(service['getAutomationTasks']).toHaveBeenCalledWith(GameAutomationAction.START_GAME);
            expect(service['automationTasks']).toEqual('test automation tasks');
            expect(service['queueNextAutomationTask']).toHaveBeenCalled();
        });
    });

    describe('queueNextAutomationTask', () => {
        it('queues up the first automation task if no info about the next task is known', async () => {
            jest.spyOn(Date.prototype, 'getTime').mockReturnValue(99999);
            jest.spyOn(global, 'setTimeout');
            jest.spyOn(AutomationActionService.prototype as any, 'completeTimedAutomationTask').mockReturnValue(null);
            replicants.gameAutomationData = {
                nextTaskForAction: null
            };
            const service = new AutomationActionService(mockNodecg, obsConnectorService);
            const firstTask = {
                name: 'firstTask',
                timeout: 1001,
                action: jest.fn()
            };
            service['automationTasks'] = [
                firstTask,
                {
                    name: 'secondTask',
                    timeout: 1002,
                    action: jest.fn()
                }
            ];

            await service['queueNextAutomationTask']();

            expect((replicants.gameAutomationData as GameAutomationData).nextTaskForAction).toEqual({
                index: 0,
                name: 'firstTask',
                executionTimeMillis: 101000
            });
            expect(service['nextAutomationTaskTimeout']).not.toBeNull();
            expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1001);
            const timeoutHandler = (setTimeout as unknown as jest.Mock).mock.calls[0][0];
            expect(service['completeTimedAutomationTask']).not.toHaveBeenCalled();

            await timeoutHandler();
            expect(service['completeTimedAutomationTask']).toHaveBeenCalledWith(firstTask);
        });

        it('queues up the automation action after the current one', async () => {
            jest.spyOn(Date.prototype, 'getTime').mockReturnValue(1111111);
            jest.spyOn(global, 'setTimeout');
            jest.spyOn(AutomationActionService.prototype as any, 'completeTimedAutomationTask').mockReturnValue(null);
            replicants.gameAutomationData = {
                nextTaskForAction: {
                    index: 0,
                    name: 'firstTask',
                    executionTimeMillis: 101000
                }
            };
            const service = new AutomationActionService(mockNodecg, obsConnectorService);
            const secondTask = {
                name: 'secondTask',
                timeout: 1002,
                action: jest.fn()
            };
            service['automationTasks'] = [
                {
                    name: 'firstTask',
                    timeout: 1001,
                    action: jest.fn()
                },
                secondTask
            ];

            await service['queueNextAutomationTask']();

            expect((replicants.gameAutomationData as GameAutomationData).nextTaskForAction).toEqual({
                index: 1,
                name: 'secondTask',
                executionTimeMillis: 1112113
            });
            expect(service['nextAutomationTaskTimeout']).not.toBeNull();
            expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1002);
            const timeoutHandler = (setTimeout as unknown as jest.Mock).mock.calls[0][0];
            expect(service['completeTimedAutomationTask']).not.toHaveBeenCalled();

            await timeoutHandler();
            expect(service['completeTimedAutomationTask']).toHaveBeenCalledWith(secondTask);
        });

        it('clears automation data if the final task has been completed', async () => {
            jest.spyOn(global, 'setTimeout');
            jest.spyOn(AutomationActionService.prototype, 'resetGameAutomationData').mockReturnValue(null);
            replicants.gameAutomationData = {
                nextTaskForAction: {
                    index: 1,
                    name: 'secondTask',
                    executionTimeMillis: 39393939
                }
            };
            const service = new AutomationActionService(mockNodecg, obsConnectorService);
            service['automationTasks'] = [
                {
                    name: 'firstTask',
                    timeout: 1001,
                    action: jest.fn()
                },
                {
                    name: 'secondTask',
                    timeout: 1002,
                    action: jest.fn()
                }
            ];

            await service['queueNextAutomationTask']();

            expect(service.resetGameAutomationData).toHaveBeenCalled();
            expect(setTimeout).not.toHaveBeenCalled();
        });

        it('executes each task with no timeout before queueing the next one', async () => {
            jest.spyOn(Date.prototype, 'getTime').mockReturnValue(1111111);
            jest.spyOn(global, 'setTimeout');
            jest.spyOn(AutomationActionService.prototype as any, 'completeTimedAutomationTask').mockReturnValue(null);
            jest.spyOn(AutomationActionService.prototype as any, 'executeAutomationTask').mockReturnValue(null);
            replicants.gameAutomationData = {
                nextTaskForAction: {
                    index: 0,
                    name: 'firstTask',
                    executionTimeMillis: 101000
                }
            };
            const service = new AutomationActionService(mockNodecg, obsConnectorService);
            const secondTask = {
                name: 'secondTask',
                timeout: 0,
                action: jest.fn()
            };
            const thirdTask = {
                name: 'thirdTask',
                timeout: 0,
                action: jest.fn()
            };
            service['automationTasks'] = [
                {
                    name: 'firstTask',
                    timeout: 1001,
                    action: jest.fn()
                },
                secondTask,
                thirdTask,
                {
                    name: 'fourthTask',
                    timeout: 1004,
                    action: jest.fn()
                }
            ];

            await service['queueNextAutomationTask']();

            expect(service['executeAutomationTask']).toHaveBeenCalledTimes(2);
            expect(service['executeAutomationTask']).toHaveBeenCalledWith(secondTask);
            expect(service['executeAutomationTask']).toHaveBeenCalledWith(thirdTask);
            expect((replicants.gameAutomationData as GameAutomationData).nextTaskForAction).toEqual({
                index: 3,
                name: 'fourthTask',
                executionTimeMillis: 1112115
            });
            expect(service['nextAutomationTaskTimeout']).not.toBeNull();
            expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1004);
        });
    });

    describe('completeTimedAutomationTask', () => {
        it('clears the timeout to complete the timed automation task, executes it and queues the next one', async () => {
            jest.spyOn(AutomationActionService.prototype as any, 'queueNextAutomationTask').mockReturnValue(null);
            jest.spyOn(AutomationActionService.prototype as any, 'executeAutomationTask').mockReturnValue(null);
            jest.spyOn(global, 'clearTimeout');
            const service = new AutomationActionService(mockNodecg, obsConnectorService);
            const timeout = setTimeout(jest.fn(), 1000);
            service['nextAutomationTaskTimeout'] = timeout;
            const task = {
                timeout: 999,
                name: 'task name',
                action: jest.fn()
            };

            await service['completeTimedAutomationTask'](task);

            expect(clearTimeout).toHaveBeenCalledWith(timeout);
            expect(service['executeAutomationTask']).toHaveBeenCalledWith(task);
            expect(service['queueNextAutomationTask']).toHaveBeenCalled();
        });
    });

    describe('executeAutomationTask', () => {
        it('completes the action of the given task', async () => {
            const action = jest.fn();
            const service = new AutomationActionService(mockNodecg, obsConnectorService);

            await service['executeAutomationTask']({
                timeout: 998,
                name: 'task name',
                action
            });

            expect(action).toHaveBeenCalled();
        });

        it('handles errors within the action', async () => {
            const action = jest.fn().mockRejectedValue('error!');
            const service = new AutomationActionService(mockNodecg, obsConnectorService);

            await expect(service['executeAutomationTask']({
                timeout: 998,
                name: 'task name',
                action
            })).resolves.toBeUndefined();

            expect(action).toHaveBeenCalled();
        });
    });

    describe('fastForwardToNextAutomationTask', () => {
        it('throws an error if no action is in progress', async () => {
            replicants.gameAutomationData = {
                actionInProgress: GameAutomationAction.NONE
            };
            const service = new AutomationActionService(mockNodecg, obsConnectorService);

            await expect(service.fastForwardToNextAutomationTask())
                .rejects.toThrow(new Error('No action is in progress.'));
        });

        it('completes the next automation task', async () => {
            jest.spyOn(AutomationActionService.prototype as any, 'completeTimedAutomationTask').mockReturnValue(null);
            replicants.gameAutomationData = {
                nextTaskForAction: {
                    index: 1,
                    name: 'secondTask',
                    executionTimeMillis: 39393939
                },
                actionInProgress: GameAutomationAction.START_GAME
            };
            const service = new AutomationActionService(mockNodecg, obsConnectorService);
            const secondTask = {
                name: 'secondTask',
                timeout: 1002,
                action: jest.fn()
            };
            service['automationTasks'] = [
                {
                    name: 'firstTask',
                    timeout: 1001,
                    action: jest.fn()
                },
                secondTask
            ];

            await service.fastForwardToNextAutomationTask();

            expect(service['completeTimedAutomationTask']).toHaveBeenCalledWith(secondTask);
        });
    });

    describe('resetGameAutomationData', () => {
        it('clears info about automation actions in progress', () => {
            replicants.gameAutomationData = {
                nextTaskForAction: {
                    index: 1,
                    name: 'secondTask',
                    executionTimeMillis: 39393939
                },
                actionInProgress: GameAutomationAction.START_GAME
            };
            const service = new AutomationActionService(mockNodecg, obsConnectorService);
            service['automationTasks'] = [
                {
                    name: 'firstTask',
                    timeout: 1001,
                    action: jest.fn()
                },
                {
                    name: 'secondTask',
                    timeout: 1002,
                    action: jest.fn()
                }
            ];

            service.resetGameAutomationData();

            expect(service['automationTasks']).toBeNull();
            expect(replicants.gameAutomationData).toEqual({
                actionInProgress: GameAutomationAction.NONE,
                nextTaskForAction: null
            });
        });
    });

    describe('cancelAutomationAction', () => {
        it('clears the timeout to execute the next automation action and resets automation data', () => {
            replicants.gameAutomationData = {
                actionInProgress: GameAutomationAction.START_GAME
            };
            jest.spyOn(AutomationActionService.prototype, 'resetGameAutomationData').mockReturnValue(null);
            jest.spyOn(global, 'clearTimeout');
            const service = new AutomationActionService(mockNodecg, obsConnectorService);
            const timeout = setTimeout(jest.fn(), 1000);
            service['nextAutomationTaskTimeout'] = timeout;

            service.cancelAutomationAction();

            expect(service.resetGameAutomationData).toHaveBeenCalled();
            expect(clearTimeout).toHaveBeenCalledWith(timeout);
        });

        it('throws an error if no action is in progress', () => {
            replicants.gameAutomationData = {
                actionInProgress: GameAutomationAction.NONE
            };
            jest.spyOn(AutomationActionService.prototype, 'resetGameAutomationData');
            jest.spyOn(global, 'clearTimeout');
            const service = new AutomationActionService(mockNodecg, obsConnectorService);

            expect(() => service.cancelAutomationAction()).toThrow(new Error('No action is in progress.'));

            expect(service.resetGameAutomationData).not.toHaveBeenCalled();
            expect(clearTimeout).not.toHaveBeenCalled();
        });
    });
});
