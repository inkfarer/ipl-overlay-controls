import { MockNodecg } from '../../__mocks__/mockNodecg';
import { GameWinner } from 'types/enums/gameWinner';
import { RoundStore } from 'schemas';
import { DateTime } from 'luxon';
import { mocked } from 'ts-jest/utils';

describe('roundStore', () => {
    const mockSetActiveRoundGames = jest.fn();
    const mockSetNextRoundGames = jest.fn();
    let nodecg: MockNodecg;
    let extension: {
        commitActiveRoundToMatchStore: () => void
    };

    const mockDateTime = mocked(DateTime, true);
    jest.mock('luxon', () => ({
        __esModule: true,
        DateTime: mockDateTime
    }));

    jest.mock('../activeRoundHelper', () => ({
        __esModule: true,
        setActiveRoundGames: mockSetActiveRoundGames
    }));

    jest.mock('../nextRoundHelper', () => ({
        __esModule: true,
        setNextRoundGames: mockSetNextRoundGames
    }));

    const mockGenerateId = jest.fn();

    jest.mock('../../../helpers/generateId', () => ({
        __esModule: true,
        generateId: mockGenerateId
    }));

    beforeEach(() => {
        jest.resetAllMocks();
        jest.resetModules();
        nodecg = new MockNodecg();
        nodecg.init();

        extension = require('../roundStore');
    });

    describe('updateRoundStore', () => {
        it('creates new round if needed', () => {
            nodecg.replicants.roundStore.value = { };
            nodecg.replicants.activeRound.value = { round: { id: '123' } };
            nodecg.replicants.nextRound.value = { round: { id: '123' } };
            const ack = jest.fn();

            nodecg.messageListeners.updateRoundStore({
                id: '234234',
                roundName: 'Cool Round',
                games: [
                    { stage: 'Blackbelly Skatepark', mode: 'Clam Blitz' },
                    { stage: 'Moray Towers', mode: 'Rainmaker' },
                    { stage: 'Manta Maria', mode: 'Tower Control' }
                ]
            }, ack);

            expect(ack).toHaveBeenCalledWith(null, {
                id: '234234',
                round: {
                    games: [
                        { stage: 'Blackbelly Skatepark', mode: 'Clam Blitz', winner: GameWinner.NO_WINNER },
                        { stage: 'Moray Towers', mode: 'Rainmaker', winner: GameWinner.NO_WINNER },
                        { stage: 'Manta Maria', mode: 'Tower Control', winner: GameWinner.NO_WINNER }
                    ],
                    meta: { name: 'Cool Round' }
                }
            });
            expect(nodecg.replicants.roundStore.value).toEqual({
                '234234': {
                    meta: {
                        name: 'Cool Round',
                        isCompleted: false
                    },
                    games: [
                        { stage: 'Blackbelly Skatepark', mode: 'Clam Blitz', winner: GameWinner.NO_WINNER },
                        { stage: 'Moray Towers', mode: 'Rainmaker', winner: GameWinner.NO_WINNER },
                        { stage: 'Manta Maria', mode: 'Tower Control', winner: GameWinner.NO_WINNER }
                    ]
                }
            });
        });

        it('updates existing rounds', () => {
            nodecg.replicants.roundStore.value = {
                aaaaaa: {
                    meta: {
                        name: 'Rad Round',
                        isCompleted: true
                    },
                    games: [
                        { stage: 'Walleye Warehouse', mode: 'Turf War', winner: GameWinner.BRAVO },
                        { stage: 'Moray Towers', mode: 'Clam Blitz', winner: GameWinner.BRAVO },
                        { stage: 'Humpback Pump Track', mode: 'Rainmaker', winner: GameWinner.NO_WINNER }
                    ]
                }
            };
            nodecg.replicants.activeRound.value = { round: { id: '123' } };
            nodecg.replicants.nextRound.value = { round: { id: '123' } };
            const ack = jest.fn();

            nodecg.messageListeners.updateRoundStore({
                id: 'aaaaaa',
                roundName: 'Rad Round (Updated)',
                games: [
                    { stage: 'MakoMart', mode: 'Clam Blitz' },
                    { stage: 'Port Mackerel', mode: 'Clam Blitz' },
                    { stage: 'Humpback Pump Track', mode: 'Tower Control' }
                ]
            }, ack);

            expect(ack).toHaveBeenCalledWith(null, {
                id: 'aaaaaa',
                round: {
                    games: [
                        { stage: 'MakoMart', mode: 'Clam Blitz', winner: GameWinner.BRAVO },
                        { stage: 'Port Mackerel', mode: 'Clam Blitz', winner: GameWinner.BRAVO },
                        { stage: 'Humpback Pump Track', mode: 'Tower Control', winner: GameWinner.NO_WINNER }
                    ],
                    meta: { name: 'Rad Round (Updated)' }
                }
            });
            expect(nodecg.replicants.roundStore.value).toEqual({
                aaaaaa: {
                    meta: {
                        name: 'Rad Round (Updated)',
                        isCompleted: true
                    },
                    games: [
                        { stage: 'MakoMart', mode: 'Clam Blitz', winner: GameWinner.BRAVO },
                        { stage: 'Port Mackerel', mode: 'Clam Blitz', winner: GameWinner.BRAVO },
                        { stage: 'Humpback Pump Track', mode: 'Tower Control', winner: GameWinner.NO_WINNER }
                    ]
                }
            });
        });

        it('updates active round if needed', () => {
            nodecg.replicants.roundStore.value = {
                '123': {
                    meta: {
                        name: 'Rad Round',
                        isCompleted: true
                    },
                    games: [
                        { stage: 'Walleye Warehouse', mode: 'Turf War', winner: GameWinner.BRAVO },
                        { stage: 'Moray Towers', mode: 'Clam Blitz', winner: GameWinner.BRAVO },
                        { stage: 'Humpback Pump Track', mode: 'Rainmaker', winner: GameWinner.NO_WINNER }
                    ]
                }
            };
            nodecg.replicants.activeRound.value = { round: { id: '123' } };
            nodecg.replicants.nextRound.value = { round: { id: '234' } };
            const ack = jest.fn();

            nodecg.messageListeners.updateRoundStore({
                id: '123',
                roundName: 'R',
                games: [
                    { stage: 'MakoMart', mode: 'Clam Blitz' },
                    { stage: 'Port Mackerel', mode: 'Clam Blitz' },
                    { stage: 'Humpback Pump Track', mode: 'Tower Control' }
                ]
            }, ack);

            expect(ack).toHaveBeenCalledWith(null, {
                id: '123',
                round: {
                    games: [
                        { stage: 'MakoMart', mode: 'Clam Blitz', winner: GameWinner.BRAVO },
                        { stage: 'Port Mackerel', mode: 'Clam Blitz', winner: GameWinner.BRAVO },
                        { stage: 'Humpback Pump Track', mode: 'Tower Control', winner: GameWinner.NO_WINNER }
                    ],
                    meta: { name: 'R' }
                }
            });
            expect(mockSetActiveRoundGames).toHaveBeenCalledWith('123');
            expect(mockSetNextRoundGames).not.toHaveBeenCalled();
        });

        it('updates next round if needed', () => {
            nodecg.replicants.roundStore.value = {
                '123': {
                    meta: {
                        name: 'Rad Round',
                        isCompleted: true
                    },
                    games: [
                        { stage: 'Walleye Warehouse', mode: 'Turf War', winner: GameWinner.BRAVO },
                        { stage: 'Moray Towers', mode: 'Clam Blitz', winner: GameWinner.BRAVO },
                        { stage: 'Humpback Pump Track', mode: 'Rainmaker', winner: GameWinner.NO_WINNER }
                    ]
                }
            };
            nodecg.replicants.activeRound.value = { round: { id: '234' } };
            nodecg.replicants.nextRound.value = { round: { id: '123' } };
            const ack = jest.fn();

            nodecg.messageListeners.updateRoundStore({
                id: '123',
                roundName: 'R',
                games: [
                    { stage: 'MakoMart', mode: 'Clam Blitz' },
                    { stage: 'Port Mackerel', mode: 'Clam Blitz' },
                    { stage: 'Humpback Pump Track', mode: 'Tower Control' }
                ]
            }, ack);

            expect(ack).toHaveBeenCalledWith(null, {
                id: '123',
                round: {
                    games: [
                        { stage: 'MakoMart', mode: 'Clam Blitz', winner: GameWinner.BRAVO },
                        { stage: 'Port Mackerel', mode: 'Clam Blitz', winner: GameWinner.BRAVO },
                        { stage: 'Humpback Pump Track', mode: 'Tower Control', winner: GameWinner.NO_WINNER }
                    ],
                    meta: { name: 'R' }
                }
            });
            expect(mockSetNextRoundGames).toHaveBeenCalledWith('123');
            expect(mockSetActiveRoundGames).not.toHaveBeenCalled();
        });

        it('generates id for round if it is not given', () => {
            mockGenerateId.mockReturnValue('new round id');
            nodecg.replicants.roundStore.value = {};
            nodecg.replicants.activeRound.value = { round: { id: '123' } };
            nodecg.replicants.nextRound.value = { round: { id: '123' } };
            const ack = jest.fn();

            nodecg.messageListeners.updateRoundStore({
                roundName: 'Rad Round (Updated)',
                games: [
                    { stage: 'MakoMart', mode: 'Clam Blitz' },
                    { stage: 'Port Mackerel', mode: 'Clam Blitz' },
                    { stage: 'Humpback Pump Track', mode: 'Tower Control' }
                ]
            }, ack);

            expect(ack).toHaveBeenCalledWith(null, {
                id: 'new round id',
                round: {
                    games: [
                        { stage: 'MakoMart', mode: 'Clam Blitz', winner: GameWinner.NO_WINNER },
                        { stage: 'Port Mackerel', mode: 'Clam Blitz', winner: GameWinner.NO_WINNER },
                        { stage: 'Humpback Pump Track', mode: 'Tower Control', winner: GameWinner.NO_WINNER }
                    ],
                    meta: { name: 'Rad Round (Updated)' }
                }
            });
            expect(nodecg.replicants.roundStore.value).toEqual({
                'new round id': {
                    meta: {
                        name: 'Rad Round (Updated)',
                        isCompleted: false
                    },
                    games: [
                        { stage: 'MakoMart', mode: 'Clam Blitz', winner: GameWinner.NO_WINNER },
                        { stage: 'Port Mackerel', mode: 'Clam Blitz', winner: GameWinner.NO_WINNER },
                        { stage: 'Humpback Pump Track', mode: 'Tower Control', winner: GameWinner.NO_WINNER }
                    ]
                }
            });
        });
    });

    describe('removeRound', () => {
        it('deletes the given round', () => {
            nodecg.replicants.roundStore.value = {
                aaaaaa: { },
                bbbbbb: { }
            };
            nodecg.replicants.activeRound.value = { round: { id: '234' } };
            nodecg.replicants.nextRound.value = { round: { id: '123' } };

            nodecg.messageListeners.removeRound({ roundId: 'aaaaaa' });

            expect(nodecg.replicants.roundStore.value).toEqual({
                bbbbbb: { }
            });
        });

        it('acknowledges with error if only one round exists', () => {
            nodecg.replicants.roundStore.value = {
                gggggg: { }
            };
            nodecg.replicants.activeRound.value = { round: { id: '234' } };
            nodecg.replicants.nextRound.value = { round: { id: '123' } };
            const ack = jest.fn();

            nodecg.messageListeners.removeRound({ roundId: 'gggggg' }, ack);

            expect(ack).toHaveBeenCalledWith(new Error('Cannot delete the last round.'));
        });

        it('acknowledges with error if the round cannot be found', () => {
            nodecg.replicants.roundStore.value = {
                aaaaaa: { },
                bbbbbb: { }
            };
            nodecg.replicants.activeRound.value = { round: { id: '234' } };
            nodecg.replicants.nextRound.value = { round: { id: '123' } };
            const ack = jest.fn();

            nodecg.messageListeners.removeRound({ roundId: 'gggggg' }, ack);

            expect(ack).toHaveBeenCalledWith(new Error('Couldn\'t find round with id \'gggggg\'.'));
        });

        it('sets active round to first round if active round is being deleted', () => {
            nodecg.replicants.roundStore.value = {
                aaaaaa: { },
                bbbbbb: { },
                gggggg: { }
            };
            nodecg.replicants.activeRound.value = { round: { id: 'bbbbbb' } };
            nodecg.replicants.nextRound.value = { round: { id: '123' } };

            nodecg.messageListeners.removeRound({ roundId: 'bbbbbb' });

            expect(mockSetActiveRoundGames).toHaveBeenCalledWith('aaaaaa');
            expect(mockSetNextRoundGames).not.toHaveBeenCalled();
        });

        it('sets next round to first round if active round is being deleted', () => {
            nodecg.replicants.roundStore.value = {
                aaaaaa: { },
                bbbbbb: { },
                gggggg: { }
            };
            nodecg.replicants.activeRound.value = { round: { id: '123' } };
            nodecg.replicants.nextRound.value = { round: { id: 'gggggg' } };

            nodecg.messageListeners.removeRound({ roundId: 'gggggg' });

            expect(mockSetNextRoundGames).toHaveBeenCalledWith('aaaaaa');
            expect(mockSetActiveRoundGames).not.toHaveBeenCalled();
        });
    });

    describe('resetRoundStore', () => {
        it('updates round store, active and next rounds', () => {
            nodecg.messageListeners.resetRoundStore();

            expect(nodecg.replicants.roundStore.value).toEqual({
                '00000': {
                    meta: {
                        name: 'Default Round 1'
                    },
                    games: [
                        {
                            stage: 'MakoMart',
                            mode: 'Clam Blitz'
                        },
                        {
                            stage: 'Ancho-V Games',
                            mode: 'Tower Control'
                        },
                        {
                            stage: 'Wahoo World',
                            mode: 'Rainmaker'
                        }
                    ]
                },
                '11111': {
                    meta: {
                        name: 'Default Round 2'
                    },
                    games: [
                        {
                            stage: 'Inkblot Art Academy',
                            mode: 'Turf War'
                        },
                        {
                            stage: 'Ancho-V Games',
                            mode: 'Tower Control'
                        },
                        {
                            stage: 'Wahoo World',
                            mode: 'Rainmaker'
                        }
                    ]
                }
            });

            expect(mockSetActiveRoundGames).toHaveBeenCalledWith('00000');
            expect(mockSetNextRoundGames).toHaveBeenCalledWith('11111');
        });
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
                        completionTime: undefined,
                        relatedRoundId: 'roundround'
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
