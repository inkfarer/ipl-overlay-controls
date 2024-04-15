import { GameWinner } from '../../../types/enums/gameWinner';
import { ActiveRound } from 'schemas';
import { PlayType } from '../../../types/enums/playType';
import { replicants } from '../../__mocks__/mockNodecg';
import { mock } from 'jest-mock-extended';
import type * as MatchStoreModule from '../../replicants/matchStore';
const mockMatchStoreModule = mock<typeof MatchStoreModule>();
jest.mock('../../replicants/matchStore', () => mockMatchStoreModule);

import { setActiveRoundGames, setActiveRoundTeams, setWinner } from '../activeRoundHelper';

describe('activeRoundHelper', () => {
    describe('setWinner', () => {
        it('sets winner and score', () => {
            replicants.activeRound = {
                teamA: { score: 0 },
                teamB: { score: 1 },
                match: {},
                games: [
                    { winner: GameWinner.NO_WINNER },
                    { winner: GameWinner.BRAVO },
                    { winner: GameWinner.NO_WINNER }
                ]
            } as ActiveRound;

            let activeRound: ActiveRound;

            setWinner(0, GameWinner.ALPHA);
            activeRound = replicants.activeRound as ActiveRound;
            expect(activeRound.games[0].winner).toBe(GameWinner.ALPHA);
            expect(activeRound.teamA.score).toBe(1);

            setWinner(2,GameWinner.BRAVO);
            activeRound = replicants.activeRound as ActiveRound;
            expect(activeRound.games[2].winner).toBe(GameWinner.BRAVO);
            expect(activeRound.teamB.score).toBe(2);

            setWinner(0,GameWinner.NO_WINNER);
            activeRound = replicants.activeRound as ActiveRound;
            expect(activeRound.games[0].winner).toBe(GameWinner.NO_WINNER);
            expect(activeRound.teamA.score).toBe(0);

            setWinner(1,GameWinner.ALPHA);
            activeRound = replicants.activeRound as ActiveRound;
            expect(activeRound.games[1].winner).toBe(GameWinner.ALPHA);
            expect(activeRound.teamA.score).toBe(1);
            expect(activeRound.teamB.score).toBe(1);
        });

        it('sets color if not already set', () => {
            replicants.swapColorsInternally = false;
            replicants.activeRound = {
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

            setWinner(1,GameWinner.ALPHA);

            expect((replicants.activeRound as ActiveRound).games[1].color).toEqual({
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
            replicants.swapColorsInternally = false;
            replicants.activeRound = {
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

            setWinner(1,GameWinner.BRAVO);

            expect((replicants.activeRound as ActiveRound).games[1].color).toEqual(existingColor);
        });

        it('removes color if setting winner to NO_WINNER', () => {
            replicants.swapColorsInternally = false;
            replicants.activeRound = {
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

            setWinner(1,GameWinner.NO_WINNER);

            expect((replicants.activeRound as ActiveRound).games[1].color).toBeUndefined();
        });

        it('acknowledges with error when trying to set winner for a game that does not exist', () => {
            replicants.activeRound = {
                teamA: { score: 0 },
                teamB: { score: 0 },
                games: [
                    { winner: GameWinner.NO_WINNER }
                ]
            };

            expect(() => setWinner(1,GameWinner.BRAVO))
                .toThrow('translation:activeRoundHelper.gameOutOfRange');
        });

        it('updates round store', () => {
            replicants.activeRound = {
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

            setWinner(0,GameWinner.BRAVO);

            expect(mockMatchStoreModule.commitActiveRoundToMatchStore).toHaveBeenCalled();
        });
    });

    describe('setActiveRoundGames', () => {
        it('updates active round data', () => {
            replicants.matchStore = {
                aaa: {
                    meta: { name: 'Cool Match', type: PlayType.BEST_OF },
                    teamA: { score: 5 },
                    teamB: { score: 10 }
                }
            };
            const activeRound = {
                teamA: { score: 0 },
                teamB: { score: 0 }
            };

            setActiveRoundGames((activeRound as ActiveRound), 'aaa');

            expect(activeRound).toEqual({
                match: {
                    id: 'aaa',
                    name: 'Cool Match',
                    type: PlayType.BEST_OF
                },
                teamA: { score: 5 },
                teamB: { score: 10 }
            });
        });

        it('throws error if match is not found', () => {
            replicants.matchStore = {
                roundroundround: { }
            };

            expect(() => setActiveRoundGames(({} as ActiveRound), 'this match does not exist'))
                .toThrow('translation:activeRoundHelper.matchNotFound');
        });
    });

    describe('setActiveRoundTeams', () => {
        it('finds team data from tournamentData and combines it with team data in activeRound', () => {
            replicants.tournamentData = {
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

            setActiveRoundTeams((activeRound as unknown as ActiveRound), '123123', '234234');

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
            replicants.tournamentData = {
                teams: [
                    { id: '456456' }
                ]
            };

            expect(() => setActiveRoundTeams(({} as ActiveRound), '456456', '123123'))
                .toThrow('translation:activeRoundHelper.teamNotFound');
        });
    });
});
