import type * as ObsSocketModule from '../obsSocket';
import { mock } from 'jest-mock-extended';
import { messageListeners, mockSendMessage, replicants } from '../../__mocks__/mockNodecg';
import { GameVersion } from '../../../types/enums/gameVersion';
import { ScoreboardData } from '../../../types/schemas';

const mockObsSocket = mock<typeof ObsSocketModule>();
jest.mock('../obsSocket', () => mockObsSocket);

import '../endStartGame';

describe('endStartGame', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.useFakeTimers();
        replicants.runtimeConfig = { gameVersion: GameVersion.SPLATOON_2 };
        replicants.obsData = { gameplayScene: 'Gameplay Scene', intermissionScene: 'Break Scene' };
        replicants.scoreboardData = { };
    });

    afterEach(() => {
        jest.clearAllTimers();
    });

    describe('startGame', () => {
        it('clears timeouts from previous calls', async () => {
            const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
            const cb = jest.fn();

            await messageListeners.startGame(null, cb);
            await messageListeners.endGame(null, jest.fn());
            await messageListeners.startGame(null, cb);
            jest.advanceTimersByTime(23500);

            expect(clearTimeoutSpy).toHaveBeenCalledTimes(4);
            expect(cb).toHaveBeenCalledTimes(2);
            clearTimeoutSpy.mockClear();
        });

        it('sets scene, shows scoreboard and casters', async () => {
            const cb = jest.fn();

            await messageListeners.startGame(null, cb);

            expect(mockObsSocket.setCurrentScene).toHaveBeenCalledWith('Gameplay Scene');
            expect((replicants.scoreboardData as ScoreboardData).isVisible).toBeUndefined();
            expect(mockSendMessage).not.toHaveBeenCalled();
            expect(cb).not.toHaveBeenCalled();
            jest.advanceTimersByTime(11500);
            expect((replicants.scoreboardData as ScoreboardData).isVisible).toEqual(true);
            expect(mockSendMessage).not.toHaveBeenCalled();
            expect(cb).not.toHaveBeenCalled();
            jest.advanceTimersByTime(12000);
            expect(mockSendMessage).toHaveBeenCalledWith('mainShowCasters');
            expect(cb).toHaveBeenCalled();
        });
    });

    describe('endGame', () => {
        it('hides the scoreboard and changes scene', async () => {
            const cb = jest.fn();

            await messageListeners.endGame(null, cb);

            jest.advanceTimersByTime(3000);
            expect((replicants.scoreboardData as ScoreboardData).isVisible).toEqual(false);
            expect(mockObsSocket.setCurrentScene).not.toHaveBeenCalled();
            expect(cb).not.toHaveBeenCalled();
            jest.advanceTimersByTime(7500);
            expect(mockObsSocket.setCurrentScene).toHaveBeenCalledWith('Break Scene');
            expect(cb).toHaveBeenCalled();
        });
    });
});
