import { MockNodecg } from '../../__mocks__/mockNodecg';
import { mocked } from 'ts-jest/utils';
import { DateTime } from 'luxon';
import { GameWinner } from '../../../types/enums/gameWinner';
import { RoundStore, TournamentData } from '../../../types/schemas';

describe('matchStore', () => {
    let nodecg: MockNodecg;
    let extension: {
        commitActiveRoundToMatchStore: () => void,
        clearMatchesWithUnknownTeams: (tournamentData: TournamentData) => void
    };

    const mockActiveRoundHelper = { setActiveRoundGames: jest.fn(), setActiveRoundTeams: jest.fn() };
    jest.mock('../activeRoundHelper', () => mockActiveRoundHelper);

    const mockDateTime = mocked(DateTime, true);
    jest.mock('luxon', () => ({
        __esModule: true,
        DateTime: mockDateTime
    }));

    const mockGenerateId = {
        generateId: jest.fn()
    };
    jest.mock('../../../helpers/generateId', () => mockGenerateId);

    beforeEach(() => {
        jest.resetAllMocks();
        jest.resetModules();
        nodecg = new MockNodecg();
        nodecg.init();

        extension = require('../matchStore');
    });

    describe('commitActiveRoundToMatchStore', () => {
        it('updates value in round store', () => {
            nodecg.replicants.activeRound.value = {
                teamA: { score: 1, name: 'Team Alpha' },
                teamB: { score: 1, name: 'Team Bravo' },
                round: { name: 'Cool Round', id: 'roundround' },
                match: { isCompleted: false, id: 'aaaaaa', name: 'Cool Match' },
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
            nodecg.replicants.matchStore.value = {
                aaaaaa: {
                    meta: {
                        name: 'Round Round',
                        isCompleted: true,
                        completionTime: '21:25'
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

            extension.commitActiveRoundToMatchStore();

            expect(nodecg.replicants.matchStore.value).toEqual({
                aaaaaa: {
                    meta: {
                        name: 'Cool Match',
                        isCompleted: false,
                        completionTime: undefined
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
            nodecg.replicants.activeRound.value = {
                teamA: { score: 1 },
                teamB: { score: 0 },
                round: { name: 'Cool Round' },
                match: { isCompleted: false, id: '123123' },
                games: [{ }, { }, { }]
            };
            nodecg.replicants.matchStore.value = {
                '123123': {
                    meta: {
                        isCompleted: true,
                        completionTime: '23:00'
                    }
                }
            };

            extension.commitActiveRoundToMatchStore();

            const matchStoreValue = (nodecg.replicants.matchStore.value as RoundStore)['123123'];
            expect(matchStoreValue.meta.isCompleted).toBe(false);
            expect(matchStoreValue.meta.completionTime).toBeUndefined();
        });
    });

    describe('clearMatchesWithUnknownTeams', () => {
        it('deletes progress for stored matches where no matching team can be found in tournament data', () => {
            nodecg.replicants.activeRound.value = {
                match: {
                    id: 'aaaa'
                }
            };
            nodecg.replicants.matchStore.value = {
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

            extension.clearMatchesWithUnknownTeams({
                teams: [
                    { id: 'aaa' },
                    { id: 'bbb' }
                ]
            } as TournamentData);

            expect(nodecg.replicants.matchStore.value).toEqual({
                aaaa: {
                    teamA: { id: 'aaa' },
                    teamB: { id: 'bbb' },
                    meta: { name: 'Round 1', isCompleted: true, completionTime: '2020-01-01' }
                }
            });
        });

        it('sets active round data if active round is using a now deleted match', () => {
            nodecg.replicants.activeRound.value = {
                match: {
                    id: 'cccc'
                }
            };
            nodecg.replicants.matchStore.value = {
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

            extension.clearMatchesWithUnknownTeams({
                teams: [
                    { id: 'aaa' },
                    { id: 'bbb' },
                    { id: 'ccc' }
                ]
            } as TournamentData);

            expect(mockActiveRoundHelper.setActiveRoundGames)
                .toHaveBeenCalledWith(nodecg.replicants.activeRound.value, 'aaaa');
            expect(mockActiveRoundHelper.setActiveRoundTeams)
                .toHaveBeenCalledWith(nodecg.replicants.activeRound.value, 'aaa', 'bbb');
        });

        it('creates match from first round if all matches are to be deleted', () => {
            mockGenerateId.generateId.mockReturnValue('idid');
            nodecg.replicants.activeRound.value = {
                match: {
                    id: 'cccc'
                }
            };
            nodecg.replicants.matchStore.value = {
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
            nodecg.replicants.roundStore.value = {
                aaaa: {
                    meta: { name: 'Round 1' },
                    games: [
                        { stage: 'Blackbelly Skatepark', mode: 'Rainmaker' },
                        { stage: 'MakoMart', mode: 'Clam Blitz' }
                    ]
                }
            };

            extension.clearMatchesWithUnknownTeams({
                teams: [
                    { id: 'ggg' },
                    { id: 'mmm' },
                    { id: 'vvv' }
                ]
            } as TournamentData);

            expect(nodecg.replicants.matchStore.value).toEqual({
                idid: {
                    teamA: {
                        id: 'ggg',
                        score: 0
                    },
                    teamB: {
                        id: 'mmm',
                        score: 0
                    },
                    meta: {
                        isCompleted: false,
                        name: 'Round 1'
                    },
                    games: [
                        { stage: 'Blackbelly Skatepark', mode: 'Rainmaker', winner: GameWinner.NO_WINNER },
                        { stage: 'MakoMart', mode: 'Clam Blitz', winner: GameWinner.NO_WINNER }
                    ]
                }
            });
            expect(mockActiveRoundHelper.setActiveRoundGames)
                .toHaveBeenCalledWith(nodecg.replicants.activeRound.value, 'idid');
            expect(mockActiveRoundHelper.setActiveRoundTeams)
                .toHaveBeenCalledWith(nodecg.replicants.activeRound.value, 'ggg', 'mmm');
        });
    });
});
