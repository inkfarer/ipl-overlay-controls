import { PlayType } from '../../../types/enums/playType';
import { mock } from 'jest-mock-extended';
import type * as NextRoundHelper from '../../helpers/nextRoundHelper';
import type * as RoundStoreHelper from '../../helpers/roundStoreHelper';
import type * as GenerateId from '../../../helpers/generateId';
const mockNextRoundHelper = mock<typeof NextRoundHelper>();
const mockGenerateId = mock<typeof GenerateId>();
const mockRoundStoreHelper = mock<typeof RoundStoreHelper>();
jest.mock('../../helpers/nextRoundHelper', () => mockNextRoundHelper);
jest.mock('../../../helpers/generateId', () => mockGenerateId);
jest.mock('../../helpers/roundStoreHelper', () => mockRoundStoreHelper);

import '../roundStore';
import { messageListeners, replicants } from '../../__mocks__/mockNodecg';

describe('roundStore', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe('insertRound', () => {
        it('returns an error if the given round already exists', () => {
            replicants.roundStore = { aaa: {} };
            const ack = jest.fn();

            messageListeners.insertRound({
                id: 'aaa'
            }, ack);

            expect(ack).toHaveBeenCalledWith(new Error('Round \'aaa\' already exists.'));
        });

        it('creates new round', () => {
            replicants.roundStore = { };
            replicants.nextRound = { round: { id: '123' } };
            const ack = jest.fn();

            messageListeners.insertRound({
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
                        { stage: 'Blackbelly Skatepark', mode: 'Clam Blitz' },
                        { stage: 'Moray Towers', mode: 'Rainmaker' },
                        { stage: 'Manta Maria', mode: 'Tower Control' }
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
                        { stage: 'Blackbelly Skatepark', mode: 'Clam Blitz' },
                        { stage: 'Moray Towers', mode: 'Rainmaker' },
                        { stage: 'Manta Maria', mode: 'Tower Control' }
                    ]
                }
            });
        });

        it('generates id for round if it is not given', () => {
            mockGenerateId.generateId.mockReturnValue('new round id');
            replicants.roundStore = {};
            replicants.nextRound = { round: { id: '123' } };
            const ack = jest.fn();

            messageListeners.insertRound({
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
                    meta: {
                        name: 'Rad Round (Updated)'
                    },
                    games: [
                        { stage: 'MakoMart', mode: 'Clam Blitz' },
                        { stage: 'Port Mackerel', mode: 'Clam Blitz' },
                        { stage: 'Humpback Pump Track', mode: 'Tower Control' }
                    ]
                }
            });
            expect(replicants.roundStore).toEqual({
                'new round id': {
                    meta: {
                        name: 'Rad Round (Updated)',
                        isCompleted: false
                    },
                    games: [
                        { stage: 'MakoMart', mode: 'Clam Blitz' },
                        { stage: 'Port Mackerel', mode: 'Clam Blitz' },
                        { stage: 'Humpback Pump Track', mode: 'Tower Control' }
                    ]
                }
            });
        });
    });

    describe('updateRound', () => {
        it('returns an error if no round is found', () => {
            replicants.roundStore = {};
            const ack = jest.fn();

            messageListeners.updateRound({
                id: 'aaaggg'
            }, ack);

            expect(ack).toHaveBeenCalledWith(new Error('Could not find round \'aaaggg\''));
        });

        it('returns an error if no round id is given', () => {
            replicants.roundStore = {};
            const ack = jest.fn();

            messageListeners.updateRound({}, ack);

            expect(ack).toHaveBeenCalledWith(new Error('No round ID given.'));
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
                        { stage: 'Walleye Warehouse', mode: 'Turf War' },
                        { stage: 'Moray Towers', mode: 'Clam Blitz' },
                        { stage: 'Humpback Pump Track', mode: 'Rainmaker' }
                    ]
                }
            };
            replicants.nextRound = { round: { id: '123' } };
            const ack = jest.fn();

            messageListeners.updateRound({
                id: 'aaaaaa',
                roundName: 'Rad Round (Updated)',
                type: PlayType.BEST_OF,
                games: [
                    { stage: 'MakoMart', mode: 'Clam Blitz' },
                    { stage: 'Port Mackerel', mode: 'Clam Blitz' },
                    { stage: 'Humpback Pump Track', mode: 'Tower Control' }
                ]
            }, ack);

            expect(ack).toHaveBeenCalledWith(null);
            expect(replicants.roundStore).toEqual({
                aaaaaa: {
                    meta: {
                        name: 'Rad Round (Updated)',
                        isCompleted: true,
                        type: PlayType.BEST_OF
                    },
                    games: [
                        { stage: 'MakoMart', mode: 'Clam Blitz' },
                        { stage: 'Port Mackerel', mode: 'Clam Blitz' },
                        { stage: 'Humpback Pump Track', mode: 'Tower Control' }
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
                        { stage: 'Walleye Warehouse', mode: 'Turf War' },
                        { stage: 'Moray Towers', mode: 'Clam Blitz' },
                        { stage: 'Humpback Pump Track', mode: 'Rainmaker' }
                    ]
                }
            };
            replicants.nextRound = { round: { id: '123' } };
            const ack = jest.fn();

            messageListeners.updateRound({
                id: '123',
                roundName: 'R',
                games: [
                    { stage: 'MakoMart', mode: 'Clam Blitz' },
                    { stage: 'Port Mackerel', mode: 'Clam Blitz' },
                    { stage: 'Humpback Pump Track', mode: 'Tower Control' }
                ]
            }, ack);

            expect(ack).toHaveBeenCalledWith(null);
            expect(mockNextRoundHelper.setNextRoundGames).toHaveBeenCalledWith('123');
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
