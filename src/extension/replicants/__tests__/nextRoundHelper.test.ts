import { MockNodecg } from '../../__mocks__/mockNodecg';
import { GameWinner } from 'types/enums/gameWinner';

describe('nextRoundHelper', () => {
    const getTeamMock = jest.fn();
    let nodecg: MockNodecg;
    let helper: {
        setNextRoundGames: (roundId: string) => void,
        setNextRoundTeams: (teamAId: string, teamBId: string) => void
    };

    jest.mock('../../helpers/tournamentDataHelper', () => ({
        __esModule: true,
        getTeam: getTeamMock
    }));

    beforeEach(() => {
        getTeamMock.mockClear();

        jest.resetModules();
        nodecg = new MockNodecg();
        nodecg.init();

        helper = require('../nextRoundHelper');
    });

    describe('setNextRoundGames', () => {
        it('sets the value for nextRound', () => {
            nodecg.replicants.roundStore.value = {
                aaaaaa: {
                    meta: {
                        name: 'Cool Round'
                    },
                    games: [
                        { stage: 'Blackbelly Skatepark', mode: 'Rainmaker', winner: GameWinner.NO_WINNER },
                        { stage: 'MakoMart', mode: 'Clam Blitz', winner: GameWinner.NO_WINNER },
                        { stage: 'Piranha Pit', mode: 'Tower Control', winner: GameWinner.NO_WINNER }
                    ]
                }
            };
            nodecg.replicants.nextRound.value = {
                round: { },
                games: [ ]
            };

            helper.setNextRoundGames('aaaaaa');

            expect(nodecg.replicants.nextRound.value).toEqual({
                round: {
                    id: 'aaaaaa',
                    name: 'Cool Round'
                },
                games: [
                    { stage: 'Blackbelly Skatepark', mode: 'Rainmaker' },
                    { stage: 'MakoMart', mode: 'Clam Blitz' },
                    { stage: 'Piranha Pit', mode: 'Tower Control' }
                ]
            });
        });

        it('throws error if round is missing', () => {
            nodecg.replicants.roundStore.value = {
                bbbbbb: { }
            };

            expect(() => helper.setNextRoundGames('aaaaaa'))
                .toThrow('Could not find round \'aaaaaa\'.');
        });
    });

    describe('setNextRoundTeams', () => {
        it('sets the value for nextRound', () => {
            nodecg.replicants.nextRound.value = {
                teamA: { },
                teamB: { }
            };
            getTeamMock
                .mockReturnValueOnce('TEAM A')
                .mockReturnValueOnce('TEAM B');

            helper.setNextRoundTeams('aaa', 'bbb');

            expect(nodecg.replicants.nextRound.value).toEqual({
                teamA: 'TEAM A',
                teamB: 'TEAM B'
            });
        });

        it('throws error on missing teams', () => {
            getTeamMock
                .mockReturnValueOnce('TEAM A')
                .mockReturnValueOnce(undefined);

            expect(() => helper.setNextRoundTeams('aaa', 'bbb')).toThrow('Could not find a team.');
        });
    });
});
