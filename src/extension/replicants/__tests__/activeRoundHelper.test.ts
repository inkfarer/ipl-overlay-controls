import { MockNodecg } from '../../__mocks__/mockNodecg';
import { GameWinner } from 'types/enums/gameWinner';
import { ActiveRound } from 'schemas';

describe('activeRoundHelper', () => {
    const commitActiveRoundMock = jest.fn();
    let nodecg: MockNodecg;
    let helper: {
        setWinner: (index: number, winner: GameWinner) => void,
        setActiveRoundGames: (activeRound: ActiveRound, matchId: string) => void,
        setActiveRoundTeams: (activeRound: ActiveRound, teamAId: string, teamBId: string) => void
    };

    jest.mock('../roundStore', () => {
        return {
            __esModule: true,
            commitActiveRoundToMatchStore: commitActiveRoundMock
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
                match: {},
                games: [
                    { winner: GameWinner.NO_WINNER },
                    { winner: GameWinner.BRAVO },
                    { winner: GameWinner.NO_WINNER }
                ]
            } as ActiveRound;

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
                match: {},
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
                match: {},
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
                match: {},
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
                match: {},
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
        it('updates active round data', () => {
            nodecg.replicants.matchStore.value = {
                aaa: {
                    meta: { relatedRoundId: 'gggg' },
                    teamA: { score: 5 },
                    teamB: { score: 10 }
                }
            };
            nodecg.replicants.roundStore.value = {
                gggg: {
                    meta: {
                        name: 'Cool Round'
                    }
                }
            };
            const activeRound = {
                teamA: { score: 0 },
                teamB: { score: 0 }
            };

            helper.setActiveRoundGames((activeRound as ActiveRound), 'aaa');

            expect(activeRound.teamA.score).toBe(5);
            expect(activeRound.teamB.score).toBe(10);
        });

        it('throws error if match is not found', () => {
            nodecg.replicants.matchStore.value = {
                roundroundround: { }
            };

            expect(() => helper.setActiveRoundGames(({} as ActiveRound), 'this match does not exist'))
                .toThrow('Could not find match \'this match does not exist\'.');
        });

        it('throws error if related round is not found', () => {
            nodecg.replicants.matchStore.value = {
                roundroundround: {
                    meta: {
                        relatedRoundId: 'this round does not exist'
                    }
                }
            };
            nodecg.replicants.roundStore.value = {
                gggg: {
                    meta: {
                        name: 'Cool Round'
                    }
                }
            };

            expect(() => helper.setActiveRoundGames(({} as ActiveRound), 'roundroundround'))
                .toThrow('Could not find related round \'this round does not exist\'.');
        });
    });

    describe('setActiveRoundTeams', () => {
        it('finds team data from tournamentData and combines it with team data in activeRound', () => {
            nodecg.replicants.tournamentData.value = {
                teams: [
                    {
                        id: '123123',
                        name: 'Team One',
                        logoUrl: 'logo://cool_team'
                    },
                    {
                        id: '234234',
                        name: 'Team Two',
                        customAttr: 'foobar'
                    }
                ]
            };
            const activeRound = {
                teamA: {
                    score: 10,
                    logoUrl: 'logo://team_one'
                },
                teamB: {
                    score: 90,
                    logoUrl: 'logo://team_two',
                    differentCustomAttr: 'yeehaw'
                }
            };

            helper.setActiveRoundTeams((activeRound as unknown as ActiveRound), '123123', '234234');

            expect(activeRound).toEqual({
                teamA: {
                    id: '123123',
                    name: 'Team One',
                    score: 10,
                    logoUrl: 'logo://cool_team'
                },
                teamB: {
                    id: '234234',
                    name: 'Team Two',
                    score: 90,
                    customAttr: 'foobar'
                }
            });
        });

        it('throws an error if it cannot find a team', () => {
            nodecg.replicants.tournamentData.value = {
                teams: [
                    { id: '456456' }
                ]
            };

            expect(() => helper.setActiveRoundTeams(({} as ActiveRound), '456456', '123123'))
                .toThrow('Could not find a team.');
        });
    });
});
