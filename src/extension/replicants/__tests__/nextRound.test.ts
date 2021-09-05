import { MockNodecg } from '../../__mocks__/mockNodecg';

describe('nextRound', () => {
    const mockSetNextRoundTeams = jest.fn();
    const mockSetNextRoundGames = jest.fn();
    let nodecg: MockNodecg;

    jest.mock('../nextRoundHelper', () => ({
        __esModule: true,
        setNextRoundTeams: mockSetNextRoundTeams,
        setNextRoundGames: mockSetNextRoundGames
    }));

    beforeEach(() => {
        jest.resetAllMocks();
        jest.resetModules();
        nodecg = new MockNodecg();
        nodecg.init();

        require('../nextRound');
    });

    describe('setNextRound', () => {
        it('sets teams', () => {
            nodecg.messageListeners.setNextRound({ teamAId: '345234', teamBId: '452523' });

            expect(mockSetNextRoundTeams).toHaveBeenCalledWith('345234', '452523');
        });

        it('sets rounds if given', () => {
            nodecg.messageListeners.setNextRound({ teamAId: '365244', teamBId: '425235', roundId: '23424' });

            expect(mockSetNextRoundTeams).toHaveBeenCalledWith('365244', '425235');
            expect(mockSetNextRoundGames).toHaveBeenCalledWith('23424');
        });

        it('handles errors', () => {
            const ack = jest.fn();
            const error = new Error('An error has occurred.');
            mockSetNextRoundTeams.mockImplementation(() => {
                throw error;
            });

            nodecg.messageListeners.setNextRound({ teamAId: '24142', teamBId: '14124324' }, ack);

            expect(ack).toHaveBeenCalledWith(error);
        });
    });
});
