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
        commitActiveRoundToRoundStore: (forceSetTeams: boolean) => void
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

            nodecg.messageListeners.updateRoundStore({
                id: '234234',
                roundName: 'Cool Round',
                games: [
                    { stage: 'Blackbelly Skatepark', mode: 'Clam Blitz' },
                    { stage: 'Moray Towers', mode: 'Rainmaker' },
                    { stage: 'Manta Maria', mode: 'Tower Control' }
                ]
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

            nodecg.messageListeners.updateRoundStore({
                id: 'aaaaaa',
                roundName: 'Rad Round (Updated)',
                games: [
                    { stage: 'MakoMart', mode: 'Clam Blitz' },
                    { stage: 'Port Mackerel', mode: 'Clam Blitz' },
                    { stage: 'Humpback Pump Track', mode: 'Tower Control' }
                ]
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

            nodecg.messageListeners.updateRoundStore({
                id: '123',
                roundName: 'R',
                games: [
                    { stage: 'MakoMart', mode: 'Clam Blitz' },
                    { stage: 'Port Mackerel', mode: 'Clam Blitz' },
                    { stage: 'Humpback Pump Track', mode: 'Tower Control' }
                ]
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

            nodecg.messageListeners.updateRoundStore({
                id: '123',
                roundName: 'R',
                games: [
                    { stage: 'MakoMart', mode: 'Clam Blitz' },
                    { stage: 'Port Mackerel', mode: 'Clam Blitz' },
                    { stage: 'Humpback Pump Track', mode: 'Tower Control' }
                ]
            });

            expect(mockSetNextRoundGames).toHaveBeenCalledWith('123');
            expect(mockSetActiveRoundGames).not.toHaveBeenCalled();
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
                        name: 'Default Round 1',
                        isCompleted: false
                    },
                    games: [
                        {
                            stage: 'MakoMart',
                            mode: 'Clam Blitz',
                            winner: GameWinner.NO_WINNER
                        },
                        {
                            stage: 'Ancho-V Games',
                            mode: 'Tower Control',
                            winner: GameWinner.NO_WINNER
                        },
                        {
                            stage: 'Wahoo World',
                            mode: 'Rainmaker',
                            winner: GameWinner.NO_WINNER
                        }
                    ]
                },
                '11111': {
                    meta: {
                        name: 'Default Round 2',
                        isCompleted: false
                    },
                    games: [
                        {
                            stage: 'Inkblot Art Academy',
                            mode: 'Turf War',
                            winner: GameWinner.NO_WINNER
                        },
                        {
                            stage: 'Ancho-V Games',
                            mode: 'Tower Control',
                            winner: GameWinner.NO_WINNER
                        },
                        {
                            stage: 'Wahoo World',
                            mode: 'Rainmaker',
                            winner: GameWinner.NO_WINNER
                        }
                    ]
                }
            });

            expect(mockSetActiveRoundGames).toHaveBeenCalledWith('00000');
            expect(mockSetNextRoundGames).toHaveBeenCalledWith('11111');
        });
    });

    describe('commitActiveRoundToRoundStore', () => {
        it('updates value in round store', () => {
            nodecg.replicants.activeRound.value = {
                teamA: { score: 1, name: 'Team Alpha' },
                teamB: { score: 1, name: 'Team Bravo' },
                round: { id: 'aaaaaa', name: 'Cool Round', isCompleted: false, },
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
            nodecg.replicants.roundStore.value = {
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

            extension.commitActiveRoundToRoundStore(false);

            expect(nodecg.replicants.roundStore.value).toEqual({
                aaaaaa: {
                    meta: {
                        name: 'Cool Round',
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

        it('does not store teams if round has not started', () => {
            nodecg.replicants.activeRound.value = {
                teamA: { score: 0, name: 'Team Alpha' },
                teamB: { score: 0, name: 'Team Bravo' },
                round: { id: 'aaaaaa', name: 'Cool Round', isCompleted: false },
                games: [
                    {
                        stage: 'Walleye Warehouse',
                        mode: 'Splat Zones',
                        winner: GameWinner.NO_WINNER
                    },
                    {
                        stage: 'Wahoo World',
                        mode: 'Rainmaker',
                        winner: GameWinner.NO_WINNER
                    },
                    {
                        stage: 'MakoMart',
                        mode: 'Clam Blitz',
                        winner: GameWinner.NO_WINNER
                    }
                ]
            };
            nodecg.replicants.roundStore.value = {
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

            extension.commitActiveRoundToRoundStore(false);

            expect(nodecg.replicants.roundStore.value).toEqual({
                aaaaaa: {
                    meta: {
                        name: 'Cool Round',
                        isCompleted: false,
                        completionTime: undefined
                    },
                    teamA: undefined,
                    teamB: undefined,
                    games: [
                        {
                            stage: 'Walleye Warehouse',
                            mode: 'Splat Zones',
                            winner: GameWinner.NO_WINNER,
                            color: undefined
                        },
                        {
                            stage: 'Wahoo World',
                            mode: 'Rainmaker',
                            winner: GameWinner.NO_WINNER,
                            color: undefined
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

        it('stores teams if forceSetTeams is true', () => {
            nodecg.replicants.activeRound.value = {
                teamA: { score: 0, name: 'Team Alpha' },
                teamB: { score: 0, name: 'Team Bravo' },
                round: { id: 'aaaaaa', name: 'Cool Round', isCompleted: false },
                games: [
                    {
                        stage: 'Walleye Warehouse',
                        mode: 'Splat Zones',
                        winner: GameWinner.NO_WINNER
                    },
                    {
                        stage: 'Wahoo World',
                        mode: 'Rainmaker',
                        winner: GameWinner.NO_WINNER
                    },
                    {
                        stage: 'MakoMart',
                        mode: 'Clam Blitz',
                        winner: GameWinner.NO_WINNER
                    }
                ]
            };
            nodecg.replicants.roundStore.value = {
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

            extension.commitActiveRoundToRoundStore(true);

            expect(nodecg.replicants.roundStore.value).toEqual({
                aaaaaa: {
                    meta: {
                        name: 'Cool Round',
                        isCompleted: false,
                        completionTime: undefined
                    },
                    teamA: { score: 0, name: 'Team Alpha' },
                    teamB: { score: 0, name: 'Team Bravo' },
                    games: [
                        {
                            stage: 'Walleye Warehouse',
                            mode: 'Splat Zones',
                            winner: GameWinner.NO_WINNER,
                            color: undefined
                        },
                        {
                            stage: 'Wahoo World',
                            mode: 'Rainmaker',
                            winner: GameWinner.NO_WINNER,
                            color: undefined
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
                round: { name: 'Cool Round', id: '123123', isCompleted: false },
                games: [{ }, { }, { }]
            };
            nodecg.replicants.roundStore.value = {
                '123123': {
                    meta: {
                        isCompleted: true,
                        completionTime: '23:00'
                    }
                }
            };

            extension.commitActiveRoundToRoundStore(false);

            const roundStoreValue = (nodecg.replicants.roundStore.value as RoundStore)['123123'];
            expect(roundStoreValue.meta.isCompleted).toBe(false);
            expect(roundStoreValue.meta.completionTime).toBeUndefined();
        });
    });
});
