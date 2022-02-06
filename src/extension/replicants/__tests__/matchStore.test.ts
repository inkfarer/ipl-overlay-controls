import { MockNodecg } from '../../__mocks__/mockNodecg';
import { mocked } from 'ts-jest/utils';
import { DateTime } from 'luxon';
import { GameWinner } from '../../../types/enums/gameWinner';
import { RoundStore } from '../../../types/schemas';

describe('matchStore', () => {
    let nodecg: MockNodecg;
    let extension: {
        commitActiveRoundToMatchStore: () => void
    };

    const mockDateTime = mocked(DateTime, true);
    jest.mock('luxon', () => ({
        __esModule: true,
        DateTime: mockDateTime
    }));

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
});
