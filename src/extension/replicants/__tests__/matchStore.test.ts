import { DateTime } from 'luxon';
import { GameWinner } from '../../../types/enums/gameWinner';
import { RoundStore, TournamentData } from '../../../types/schemas';
import { PlayType } from '../../../types/enums/playType';
import { mock } from 'jest-mock-extended';
import type * as ActiveRoundHelper from '../activeRoundHelper';
import type * as GenerateId from '../../../helpers/generateId';
import type * as MatchStoreHelper from '../../helpers/matchStoreHelper';
import { replicants } from '../../__mocks__/mockNodecg';

const mockActiveRoundHelper = mock<typeof ActiveRoundHelper>();
const mockDateTime = mock<typeof DateTime>();
const mockGenerateId = mock<typeof GenerateId>();
const mockMatchStoreHelper = mock<typeof MatchStoreHelper>();
jest.mock('../activeRoundHelper', () => mockActiveRoundHelper);
jest.mock('luxon', () => ({ __esModule: true, DateTime: mockDateTime }));
jest.mock('../../../helpers/generateId', () => mockGenerateId);
jest.mock('../../helpers/matchStoreHelper', () => mockMatchStoreHelper);

import { clearMatchesWithUnknownTeams, commitActiveRoundToMatchStore } from '../matchStore';

describe('matchStore', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe('commitActiveRoundToMatchStore', () => {
        it('updates value in round store', () => {
            replicants.activeRound = {
                teamA: { score: 1, name: 'Team Alpha' },
                teamB: { score: 1, name: 'Team Bravo' },
                match: { isCompleted: false, id: 'aaaaaa', name: 'Cool Match', type: PlayType.BEST_OF },
                games: [
                    {
                        stage: 'Walleye Warehouse',
                        mode: 'Splat Zones',
                        winner: GameWinner.ALPHA,
                        color: { name: 'Cool Color' }
                    },
                    {
                        stage: 'Wahoo World',
                        mode: 'Rainmaker',
                        winner: GameWinner.BRAVO,
                        color: { name: 'Neat Color' }
                    },
                    {
                        stage: 'MakoMart',
                        mode: 'Clam Blitz',
                        winner: GameWinner.NO_WINNER
                    }
                ]
            };
            replicants.matchStore = {
                aaaaaa: {
                    meta: {
                        name: 'Round Round',
                        isCompleted: true,
                        completionTime: '21:25',
                        type: PlayType.PLAY_ALL
                    },
                    teamA: { score: 0, name: 'Team Alpha (Old)' },
                    teamB: { score: 2, name: 'Team Bravo (Old)' },
                    games: [
                        {
                            stage: 'Walleye Warehouse',
                            mode: 'Splat Zones',
                            winner: GameWinner.BRAVO,
                            color: { name: 'Cool Color' }
                        },
                        {
                            stage: 'MakoMart',
                            mode: 'Grainmaker',
                            winner: GameWinner.BRAVO,
                            color: { name: 'Color Color' }
                        },
                        {
                            stage: 'MakoMart',
                            mode: 'Clam Blitz',
                            winner: GameWinner.NO_WINNER
                        }
                    ]
                }
            };

            commitActiveRoundToMatchStore();

            expect(replicants.matchStore).toEqual({
                aaaaaa: {
                    meta: {
                        name: 'Cool Match',
                        isCompleted: false,
                        completionTime: undefined,
                        type: PlayType.BEST_OF
                    },
                    teamA: { score: 1, name: 'Team Alpha' },
                    teamB: { score: 1, name: 'Team Bravo' },
                    games: [
                        {
                            stage: 'Walleye Warehouse',
                            mode: 'Splat Zones',
                            winner: GameWinner.ALPHA,
                            color: { name: 'Cool Color' }
                        },
                        {
                            stage: 'Wahoo World',
                            mode: 'Rainmaker',
                            winner: GameWinner.BRAVO,
                            color: { name: 'Neat Color' }
                        },
                        {
                            stage: 'MakoMart',
                            mode: 'Clam Blitz',
                            winner: GameWinner.NO_WINNER,
                            color: undefined
                        }
                    ]
                }
            });
        });

        it('removes round completion time if active round is incomplete', () => {
            replicants.activeRound = {
                teamA: { score: 1 },
                teamB: { score: 0 },
                round: { name: 'Cool Round' },
                match: { isCompleted: false, id: '123123' },
                games: [{ }, { }, { }]
            };
            replicants.matchStore = {
                '123123': {
                    meta: {
                        isCompleted: true,
                        completionTime: '23:00'
                    }
                }
            };

            commitActiveRoundToMatchStore();

            const matchStoreValue = (replicants.matchStore as RoundStore)['123123'];
            expect(matchStoreValue.meta.isCompleted).toBe(false);
            expect(matchStoreValue.meta.completionTime).toBeUndefined();
        });
    });

    describe('clearMatchesWithUnknownTeams', () => {
        it('deletes progress for stored matches where no matching team can be found in tournament data', () => {
            replicants.activeRound = {
                match: {
                    id: 'aaaa'
                }
            };
            replicants.matchStore = {
                aaaa: {
                    teamA: { id: 'aaa' },
                    teamB: { id: 'bbb' },
                    meta: { name: 'Round 1', isCompleted: true, completionTime: '2020-01-01' }
                },
                bbbb: {
                    teamA: { id: 'aaa' },
                    teamB: { id: 'ccc' },
                    meta: { name: 'Round 2', isCompleted: true, completionTime: '2020-01-02' }
                },
                cccc: {
                    teamA: { id: 'ddd' },
                    teamB: { id: 'bbb' },
                    meta: { name: 'Round 3', isCompleted: false }
                }
            };

            clearMatchesWithUnknownTeams({
                teams: [
                    { id: 'aaa' },
                    { id: 'bbb' }
                ]
            } as TournamentData);

            expect(replicants.matchStore).toEqual({
                aaaa: {
                    teamA: { id: 'aaa' },
                    teamB: { id: 'bbb' },
                    meta: { name: 'Round 1', isCompleted: true, completionTime: '2020-01-01' }
                }
            });
        });

        it('sets active round data if active round is using a now deleted match', () => {
            replicants.activeRound = {
                match: {
                    id: 'cccc'
                }
            };
            replicants.matchStore = {
                aaaa: {
                    teamA: { id: 'aaa' },
                    teamB: { id: 'bbb' },
                    meta: { name: 'Round 1', isCompleted: true, completionTime: '2020-01-01' }
                },
                bbbb: {
                    teamA: { id: 'aaa' },
                    teamB: { id: 'ccc' },
                    meta: { name: 'Round 2', isCompleted: true, completionTime: '2020-01-02' }
                },
                cccc: {
                    teamA: { id: 'ddd' },
                    teamB: { id: 'bbb' },
                    meta: { name: 'Round 3', isCompleted: false }
                }
            };

            clearMatchesWithUnknownTeams({
                teams: [
                    { id: 'aaa' },
                    { id: 'bbb' },
                    { id: 'ccc' }
                ]
            } as TournamentData);

            expect(mockMatchStoreHelper.setActiveRoundToFirstMatch).toHaveBeenCalled();
        });

        it('creates match from first round if all matches are to be deleted', () => {
            mockGenerateId.generateId.mockReturnValue('idid');
            replicants.activeRound = {
                match: {
                    id: 'cccc'
                }
            };
            replicants.matchStore = {
                aaaa: {
                    teamA: { id: 'aaa' },
                    teamB: { id: 'bbb' },
                    meta: { name: 'Round 1', isCompleted: true, completionTime: '2020-01-01' }
                },
                bbbb: {
                    teamA: { id: 'aaa' },
                    teamB: { id: 'ccc' },
                    meta: { name: 'Round 2', isCompleted: true, completionTime: '2020-01-02' }
                },
                cccc: {
                    teamA: { id: 'ddd' },
                    teamB: { id: 'bbb' },
                    meta: { name: 'Round 3', isCompleted: false }
                }
            };
            replicants.roundStore = {
                aaaa: {
                    meta: { name: 'Round 1', type: PlayType.BEST_OF },
                    games: [
                        { stage: 'Blackbelly Skatepark', mode: 'Rainmaker' },
                        { stage: 'MakoMart', mode: 'Clam Blitz' }
                    ]
                }
            };

            clearMatchesWithUnknownTeams({
                teams: [
                    { id: 'ggg' },
                    { id: 'mmm' },
                    { id: 'vvv' }
                ]
            } as TournamentData);

            expect(mockMatchStoreHelper.resetMatchStore).toHaveBeenCalled();
        });
    });
});
