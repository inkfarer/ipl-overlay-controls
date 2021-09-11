import { MockNodecg } from '../../__mocks__/mockNodecg';
import { GameWinner } from 'types/enums/gameWinner';
import { ActiveRound } from 'schemas';

describe('activeRoundHelper', () => {
    const commitActiveRoundMock = jest.fn();
    let nodecg: MockNodecg;
    let helper: {
        setWinner: (index: number, winner: GameWinner) => void,
        setActiveRoundGames: (roundId: string) => void,
        setActiveRoundTeams: (teamAId: string, teamBId: string) => void
    };

    jest.mock('../roundStore', () => {
        return {
            __esModule: true,
            commitActiveRoundToRoundStore: commitActiveRoundMock
        };
    });

    beforeEach(() => {
        commitActiveRoundMock.mockClear();

        jest.resetModules();
        nodecg = new MockNodecg();
        nodecg.init();

        helper = require('../activeRoundHelper');
    });

    describe('setWinner', () => {
        it('sets winner and score', () => {
            nodecg.replicants.activeRound.value = {
                teamA: { score: 0 },
                teamB: { score: 1 },
                round: { id: 'asdasdasd' },
                games: [
                    { winner: GameWinner.NO_WINNER },
                    { winner: GameWinner.BRAVO },
                    { winner: GameWinner.NO_WINNER }
                ]
            };

            let activeRound: ActiveRound;

            helper.setWinner(0, GameWinner.ALPHA);
            activeRound = nodecg.replicants.activeRound.value as ActiveRound;
            expect(activeRound.games[0].winner).toBe(GameWinner.ALPHA);
            expect(activeRound.teamA.score).toBe(1);

            helper.setWinner(2,GameWinner.BRAVO);
            activeRound = nodecg.replicants.activeRound.value as ActiveRound;
            expect(activeRound.games[2].winner).toBe(GameWinner.BRAVO);
            expect(activeRound.teamB.score).toBe(2);

            helper.setWinner(0,GameWinner.NO_WINNER);
            activeRound = nodecg.replicants.activeRound.value as ActiveRound;
            expect(activeRound.games[0].winner).toBe(GameWinner.NO_WINNER);
            expect(activeRound.teamA.score).toBe(0);

            helper.setWinner(1,GameWinner.ALPHA);
            activeRound = nodecg.replicants.activeRound.value as ActiveRound;
            expect(activeRound.games[1].winner).toBe(GameWinner.ALPHA);
            expect(activeRound.teamA.score).toBe(1);
            expect(activeRound.teamB.score).toBe(1);
        });

        it('sets color if not already set', () => {
            nodecg.replicants.swapColorsInternally.value = false;
            nodecg.replicants.activeRound.value = {
                teamA: { score: 0, color: 'Team A Color' },
                teamB: { score: 1, color: 'Team B Color' },
                round: { id: 'asdasdasd' },
                activeColor: {
                    name: 'Cool Color'
                },
                games: [
                    { winner: GameWinner.NO_WINNER },
                    { winner: GameWinner.BRAVO },
                    { winner: GameWinner.NO_WINNER }
                ]
            };

            helper.setWinner(1,GameWinner.ALPHA);

            expect((nodecg.replicants.activeRound.value as ActiveRound).games[1].color).toEqual({
                name: 'Cool Color',
                clrA: 'Team A Color',
                clrB: 'Team B Color',
                colorsSwapped: false
            });
        });

        it('does not set color if already set', () => {
            const existingColor = {
                name: 'Cooler Color',
                clrA: 'Team B Color 2',
                clrB: 'Team A Color 2',
                colorsSwapped: true
            };
            nodecg.replicants.swapColorsInternally.value = false;
            nodecg.replicants.activeRound.value = {
                teamA: { score: 0, color: 'Team A Color' },
                teamB: { score: 1, color: 'Team B Color' },
                round: { id: 'asdasdasd' },
                activeColor: {
                    name: 'Cool Color'
                },
                games: [
                    { winner: GameWinner.NO_WINNER },
                    { winner: GameWinner.BRAVO, color: existingColor },
                    { winner: GameWinner.NO_WINNER }
                ]
            };

            helper.setWinner(1,GameWinner.BRAVO);

            expect((nodecg.replicants.activeRound.value as ActiveRound).games[1].color).toEqual(existingColor);
        });

        it('removes color if setting winner to NO_WINNER', () => {
            nodecg.replicants.swapColorsInternally.value = false;
            nodecg.replicants.activeRound.value = {
                teamA: { score: 0, color: 'Team A Color' },
                teamB: { score: 1, color: 'Team B Color' },
                round: { id: 'asdasdasd' },
                activeColor: {
                    name: 'Cool Color'
                },
                games: [
                    { winner: GameWinner.NO_WINNER },
                    { winner: GameWinner.BRAVO, color: { name: 'Cool Color 2' } },
                    { winner: GameWinner.NO_WINNER }
                ]
            };

            helper.setWinner(1,GameWinner.NO_WINNER);

            expect((nodecg.replicants.activeRound.value as ActiveRound).games[1].color).toBeUndefined();
        });

        it('acknowledges with error when trying to set winner for a game that does not exist', () => {
            nodecg.replicants.activeRound.value = {
                teamA: { score: 0 },
                teamB: { score: 0 },
                games: [
                    { winner: GameWinner.NO_WINNER }
                ]
            };

            expect(() => helper.setWinner(1,GameWinner.BRAVO))
                .toThrow('Cannot set winner for game 2 as it does not exist.');
        });

        it('updates round store', () => {
            nodecg.replicants.activeRound.value = {
                teamA: { score: 0 },
                teamB: { score: 0 },
                round: { id: 'asdasdasd' },
                games: [
                    { winner: GameWinner.NO_WINNER },
                    { winner: GameWinner.BRAVO },
                    { winner: GameWinner.NO_WINNER }
                ]
            };

            helper.setWinner(0,GameWinner.BRAVO);

            expect(commitActiveRoundMock).toHaveBeenCalled();
        });
    });

    describe('setActiveRoundGames', () => {
        it('updates active round', () => {
            const games = [
                { stage: 'Blackbelly Skatepark', mode: 'Rainmaker' },
                { stage: 'MakoMart', mode: 'Tower Control' },
                { stage: 'Wahoo World', mode: 'Turf War' }
            ];
            nodecg.replicants.roundStore.value = {
                aaaaaa: {
                    meta: { name: 'Cool Round' },
                    games
                },
                bbbbbb: {
                    meta: { name: 'Other Round' },
                    games: [
                        {
                            stage: 'Manta Maria',
                            mode: 'Boat'
                        }
                    ]
                }
            };
            nodecg.replicants.activeRound.value = {
                round: { id: 'roundround', name: 'A round' },
                teamA: {},
                teamB: {}
            };

            helper.setActiveRoundGames('aaaaaa');

            const activeRound = nodecg.replicants.activeRound.value as ActiveRound;
            expect(activeRound.round).toEqual({ name: 'Cool Round', id: 'aaaaaa' });
            expect(activeRound.games).toEqual(games);
        });

        it('sets scores if they exist in the stored round', () => {
            nodecg.replicants.roundStore.value = {
                aaa: {
                    meta: { },
                    teamA: { score: 5 },
                    teamB: { score: 10 }
                }
            };
            nodecg.replicants.activeRound.value = {
                teamA: { score: 0 },
                teamB: { score: 0 }
            };

            helper.setActiveRoundGames('aaa');

            const activeRound = nodecg.replicants.activeRound.value as ActiveRound;
            expect(activeRound.teamA.score).toBe(5);
            expect(activeRound.teamB.score).toBe(10);
        });

        it('resets scores if they do not exist in the stored round', () => {
            nodecg.replicants.roundStore.value = {
                roundround: {
                    meta: { },
                }
            };
            nodecg.replicants.activeRound.value = {
                teamA: { score: 100 },
                teamB: { score: 101 }
            };

            helper.setActiveRoundGames('roundround');

            const activeRound = nodecg.replicants.activeRound.value as ActiveRound;
            expect(activeRound.teamA.score).toBe(0);
            expect(activeRound.teamB.score).toBe(0);
        });

        it('throws error if round is not found', () => {
            nodecg.replicants.roundStore.value = {
                roundroundround: { }
            };

            expect(() => helper.setActiveRoundGames('this round does not exist'))
                .toThrow('Could not find round \'this round does not exist\'.');
        });
    });

    describe('setActiveRoundTeams', () => {
        it('find team data from tournamentData and combines it with team data in activeRound', () => {
            nodecg.replicants.tournamentData.value = {
                teams: [
                    {
                        id: '123123',
                        name: 'Team One'
                    },
                    {
                        id: '234234',
                        name: 'Team Two'
                    }
                ]
            };
            nodecg.replicants.activeRound.value = {
                teamA: {
                    score: 10,
                    logoUrl: 'logo://team_one'
                },
                teamB: {
                    score: 90,
                    logoUrl: 'logo://team_two'
                }
            };

            helper.setActiveRoundTeams('123123', '234234');

            expect(nodecg.replicants.activeRound.value).toEqual({
                teamA: {
                    id: '123123',
                    name: 'Team One',
                    score: 10
                },
                teamB: {
                    id: '234234',
                    name: 'Team Two',
                    score: 90
                }
            });
        });

        it('throws an error if it cannot find a team', () => {
            nodecg.replicants.tournamentData.value = {
                teams: [
                    { id: '456456' }
                ]
            };

            expect(() => helper.setActiveRoundTeams('456456', '123123'))
                .toThrow('Could not find a team.');
        });
    });
});
