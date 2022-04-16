import type * as ObsSocketModule from '../obsSocket';
import { mock } from 'jest-mock-extended';
import { messageListeners, mockSendMessage, replicants } from '../../__mocks__/mockNodecg';
import { GameVersion } from '../../../types/enums/gameVersion';
import { GameAutomationData, ScoreboardData } from '../../../types/schemas';
import type * as ActiveRoundModule from '../../replicants/activeRound';

const mockActiveRoundModule = mock<typeof ActiveRoundModule>();
jest.mock('../../replicants/activeRound', () => mockActiveRoundModule);
const mockObsSocket = mock<typeof ObsSocketModule>();
jest.mock('../obsSocket', () => mockObsSocket);

import '../endStartGame';
import { GameAutomationAction } from '../../../types/enums/GameAutomationAction';
import { flushPromises } from '@vue/test-utils';

describe('endStartGame', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.useFakeTimers();
        replicants.obsData = { gameplayScene: 'Gameplay Scene', intermissionScene: 'Break Scene' };
        replicants.scoreboardData = { };
        replicants.gameAutomationData = {
            actionInProgress: GameAutomationAction.NONE,
            nextTaskForAction: null
        };
    });

    afterEach(() => {
        jest.clearAllTimers();
    });

    describe.each([
        { version: GameVersion.SPLATOON_2, timings: [11500, 12000]},
        { version: GameVersion.SPLATOON_3, timings: [11500, 12000]},
    ])('startGame on $version', args => {
        beforeEach(() => {
            replicants.runtimeConfig = { gameVersion: args.version };
        });

        it('returns an error when an action is already in progress', () => {
            const ack = jest.fn();
            (replicants.gameAutomationData as GameAutomationData).actionInProgress = GameAutomationAction.END_GAME;

            messageListeners.startGame(null, ack);

            expect(ack).toHaveBeenCalledWith(new Error('An action is already in progress.'));
        });

        it('completes expected tasks', async () => {
            const ack = jest.fn();

            messageListeners.startGame(null, ack);
            await flushPromises();

            expect(mockObsSocket.setCurrentScene).toHaveBeenCalledWith('Gameplay Scene');
            expect((replicants.scoreboardData as ScoreboardData).isVisible).toBeUndefined();
            expect(mockSendMessage).not.toHaveBeenCalled();
            expect((replicants.gameAutomationData as GameAutomationData).nextTaskForAction)
                .toEqual({ index: 1, name: 'showScoreboard' });

            jest.advanceTimersByTime(args.timings[0]);
            expect((replicants.scoreboardData as ScoreboardData).isVisible).toEqual(true);
            expect(mockSendMessage).not.toHaveBeenCalled();
            expect((replicants.gameAutomationData as GameAutomationData).nextTaskForAction)
                .toEqual({ name: 'showCasters', index: 2 });

            jest.advanceTimersByTime(args.timings[1]);
            expect(mockSendMessage).toHaveBeenCalledWith('mainShowCasters');
            expect((replicants.gameAutomationData as GameAutomationData).nextTaskForAction).toBeNull();
        });
    });

    describe.each([
        { version: GameVersion.SPLATOON_2, timings: [3000, 7500]},
        { version: GameVersion.SPLATOON_3, timings: [3000, 7500]},
    ])('endGame on $version', args => {
        beforeEach(() => {
            replicants.runtimeConfig = { gameVersion: args.version };
        });

        it('returns an error when an action is already in progress', () => {
            const ack = jest.fn();
            (replicants.gameAutomationData as GameAutomationData).actionInProgress = GameAutomationAction.END_GAME;

            messageListeners.endGame(null, ack);

            expect(ack).toHaveBeenCalledWith(new Error('An action is already in progress.'));
        });

        it('completes expected tasks', async () => {
            const ack = jest.fn();

            messageListeners.endGame(null, ack);

            expect(ack).toHaveBeenCalledWith(null);
            expect(mockObsSocket.setCurrentScene).not.toHaveBeenCalled();
            expect((replicants.scoreboardData as ScoreboardData).isVisible).toBeUndefined();
            expect((replicants.gameAutomationData as GameAutomationData).nextTaskForAction)
                .toEqual({ name: 'hideScoreboard', index: 0 });

            jest.advanceTimersByTime(args.timings[0]);
            expect((replicants.scoreboardData as ScoreboardData).isVisible).toEqual(false);
            expect(mockObsSocket.setCurrentScene).not.toHaveBeenCalled();
            expect((replicants.gameAutomationData as GameAutomationData).nextTaskForAction)
                .toEqual({ name: 'changeScene', index: 1 });

            jest.advanceTimersByTime(args.timings[1]);
            expect(mockObsSocket.setCurrentScene).toHaveBeenCalledWith('Break Scene');
            expect((replicants.gameAutomationData as GameAutomationData).nextTaskForAction).toBeNull();
        });
    });

    describe('fastForwardToNextGameAutomationTask', () => {
        beforeEach(() => {
            replicants.runtimeConfig = { gameVersion: GameVersion.SPLATOON_2 };
            (replicants.gameAutomationData as GameAutomationData).actionInProgress = GameAutomationAction.NONE;
        });

        it('returns error if no action is in progress', () => {
            const ack = jest.fn();
            (replicants.gameAutomationData as GameAutomationData).actionInProgress = GameAutomationAction.NONE;

            messageListeners.fastForwardToNextGameAutomationTask(null, ack);

            expect(ack).toHaveBeenCalledWith(new Error('No action is in progress.'));
        });

        it('completes next automation task', () => {
            messageListeners.endGame(null, jest.fn());
            const ack = jest.fn();

            expect((replicants.gameAutomationData as GameAutomationData).nextTaskForAction)
                .toEqual({ name: 'hideScoreboard', index: 0 });

            messageListeners.fastForwardToNextGameAutomationTask(null, ack);

            expect((replicants.scoreboardData as ScoreboardData).isVisible).toEqual(false);
            expect((replicants.gameAutomationData as GameAutomationData).nextTaskForAction)
                .toEqual({ name: 'changeScene', index: 1 });
            expect(ack).toHaveBeenCalledWith(null);
        });

        it('sets timeout to execute next automation task', () => {
            messageListeners.endGame(null, jest.fn());
            const ack = jest.fn();

            expect((replicants.gameAutomationData as GameAutomationData).nextTaskForAction)
                .toEqual({ name: 'hideScoreboard', index: 0 });

            messageListeners.fastForwardToNextGameAutomationTask(null, ack);

            expect((replicants.gameAutomationData as GameAutomationData).nextTaskForAction)
                .toEqual({ name: 'changeScene', index: 1 });
            expect(ack).toHaveBeenCalledWith(null);

            jest.advanceTimersByTime(7500);
            expect((replicants.gameAutomationData as GameAutomationData).nextTaskForAction).toBeNull();
        });
    });
});
