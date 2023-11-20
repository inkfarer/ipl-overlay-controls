import { mock } from 'jest-mock-extended';
import type * as NextRoundHelper from '../../helpers/nextRoundHelper';
const mockNextRoundHelper = mock<typeof NextRoundHelper>();
jest.mock('../../helpers/nextRoundHelper', () => mockNextRoundHelper);

import '../nextRound';
import { messageListeners, replicants } from '../../__mocks__/mockNodecg';
import { NextRound } from 'schemas';

describe('nextRound', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        replicants.nextRound = { name: 'original test next round name' };
    });

    describe('setNextRound', () => {
        it('sets teams and the round name', () => {
            const ack = jest.fn();

            messageListeners.setNextRound({ teamAId: '345234', teamBId: '452523', name: 'cool round' }, ack);

            expect(mockNextRoundHelper.setNextRoundTeams).toHaveBeenCalledWith('345234', '452523');
            expect(ack).toHaveBeenCalledWith(null);
            expect((replicants.nextRound as NextRound).name).toEqual('cool round');
        });

        it('sets rounds if given', () => {
            const ack = jest.fn();

            messageListeners.setNextRound({ teamAId: '365244', teamBId: '425235', roundId: '23424', name: 'cooler round' }, ack);

            expect(mockNextRoundHelper.setNextRoundTeams).toHaveBeenCalledWith('365244', '425235');
            expect(mockNextRoundHelper.setNextRoundGames).toHaveBeenCalledWith('23424');
            expect(ack).toHaveBeenCalledWith(null);
            expect((replicants.nextRound as NextRound).name).toEqual('cooler round');
        });

        it('handles errors', () => {
            const ack = jest.fn();
            const error = new Error('An error has occurred.');
            mockNextRoundHelper.setNextRoundTeams.mockImplementation(() => {
                throw error;
            });

            messageListeners.setNextRound({ teamAId: '24142', teamBId: '14124324', name: 'cool round' }, ack);

            expect(ack).toHaveBeenCalledWith(error);
        });
    });
});
