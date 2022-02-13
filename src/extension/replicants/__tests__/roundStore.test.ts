import { GameWinner } from 'types/enums/gameWinner';
import { PlayType } from '../../../types/enums/playType';
import { mock } from 'jest-mock-extended';
import type * as NextRoundHelper from '../nextRoundHelper';
import type * as RoundStoreHelper from '../../helpers/roundStoreHelper';
import type * as GenerateId from '../../../helpers/generateId';
const mockNextRoundHelper = mock<typeof NextRoundHelper>();
const mockGenerateId = mock<typeof GenerateId>();
const mockRoundStoreHelper = mock<typeof RoundStoreHelper>();
jest.mock('../nextRoundHelper', () => mockNextRoundHelper);
jest.mock('../../../helpers/generateId', () => mockGenerateId);
jest.mock('../../helpers/roundStoreHelper', () => mockRoundStoreHelper);

import '../roundStore';
import { messageListeners, replicants } from '../../__mocks__/mockNodecg';

describe('roundStore', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe('updateRoundStore', () => {
        it('creates new round if needed', () => {
            replicants.roundStore = { };
            replicants.nextRound = { round: { id: '123' } };
            const ack = jest.fn();

            messageListeners.updateRoundStore({
                id: '234234',
                roundName: 'Cool Round',
                type: PlayType.PLAY_ALL,
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
                    meta: { name: 'Cool Round', type: PlayType.PLAY_ALL }
                }
            });
            expect(replicants.roundStore).toEqual({
                '234234': {
                    meta: {
                        name: 'Cool Round',
                        isCompleted: false,
                        type: PlayType.PLAY_ALL
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
            replicants.roundStore = {
                aaaaaa: {
                    meta: {
                        name: 'Rad Round',
                        isCompleted: true,
                        type: PlayType.PLAY_ALL
                    },
                    games: [
                        { stage: 'Walleye Warehouse', mode: 'Turf War', winner: GameWinner.BRAVO },
                        { stage: 'Moray Towers', mode: 'Clam Blitz', winner: GameWinner.BRAVO },
                        { stage: 'Humpback Pump Track', mode: 'Rainmaker', winner: GameWinner.NO_WINNER }
                    ]
                }
            };
            replicants.nextRound = { round: { id: '123' } };
            const ack = jest.fn();

            messageListeners.updateRoundStore({
                id: 'aaaaaa',
                roundName: 'Rad Round (Updated)',
                type: PlayType.BEST_OF,
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
                    meta: { name: 'Rad Round (Updated)', type: PlayType.BEST_OF }
                }
            });
            expect(replicants.roundStore).toEqual({
                aaaaaa: {
                    meta: {
                        name: 'Rad Round (Updated)',
                        isCompleted: true,
                        type: PlayType.BEST_OF
                    },
                    games: [
                        { stage: 'MakoMart', mode: 'Clam Blitz', winner: GameWinner.BRAVO },
                        { stage: 'Port Mackerel', mode: 'Clam Blitz', winner: GameWinner.BRAVO },
                        { stage: 'Humpback Pump Track', mode: 'Tower Control', winner: GameWinner.NO_WINNER }
                    ]
                }
            });
        });

        it('updates next round if needed', () => {
            replicants.roundStore = {
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
            replicants.nextRound = { round: { id: '123' } };
            const ack = jest.fn();

            messageListeners.updateRoundStore({
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
            expect(mockNextRoundHelper.setNextRoundGames).toHaveBeenCalledWith('123');
        });

        it('generates id for round if it is not given', () => {
            mockGenerateId.generateId.mockReturnValue('new round id');
            replicants.roundStore = {};
            replicants.nextRound = { round: { id: '123' } };
            const ack = jest.fn();

            messageListeners.updateRoundStore({
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
            expect(replicants.roundStore).toEqual({
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
            replicants.roundStore = {
                aaaaaa: { },
                bbbbbb: { }
            };
            replicants.nextRound = { round: { id: '123' } };

            messageListeners.removeRound({ roundId: 'aaaaaa' });

            expect(replicants.roundStore).toEqual({
                bbbbbb: { }
            });
        });

        it('acknowledges with error if only one round exists', () => {
            replicants.roundStore = {
                gggggg: { }
            };
            replicants.nextRound = { round: { id: '123' } };
            const ack = jest.fn();

            messageListeners.removeRound({ roundId: 'gggggg' }, ack);

            expect(ack).toHaveBeenCalledWith(new Error('Cannot delete the last round.'));
        });

        it('acknowledges with error if the round cannot be found', () => {
            replicants.roundStore = {
                aaaaaa: { },
                bbbbbb: { }
            };
            replicants.nextRound = { round: { id: '123' } };
            const ack = jest.fn();

            messageListeners.removeRound({ roundId: 'gggggg' }, ack);

            expect(ack).toHaveBeenCalledWith(new Error('Couldn\'t find round with id \'gggggg\'.'));
        });

        it('sets next round to first round if active round is being deleted', () => {
            replicants.roundStore = {
                aaaaaa: { },
                bbbbbb: { },
                gggggg: { }
            };
            replicants.nextRound = { round: { id: 'gggggg' } };

            messageListeners.removeRound({ roundId: 'gggggg' });

            expect(mockNextRoundHelper.setNextRoundGames).toHaveBeenCalledWith('aaaaaa');
        });
    });

    describe('resetRoundStore', () => {
        it('resets round store', () => {
            messageListeners.resetRoundStore();

            expect(mockRoundStoreHelper.resetRoundStore).toHaveBeenCalled();
        });
    });
});
