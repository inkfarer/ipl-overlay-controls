import { ActiveRound, NextRound } from 'schemas';
import { GameWinner } from 'types/enums/gameWinner';
import { PlayType } from '../../../types/enums/playType';
import { messageListeners, replicantChangeListeners, replicants } from '../../__mocks__/mockNodecg';
import { mock } from 'jest-mock-extended';
import type * as MatchStoreModule from '../matchStore';
import type * as ActiveRoundHelper from '../activeRoundHelper';
import type * as GenerateId from '../../../helpers/generateId';
const mockMatchStoreModule = mock<typeof MatchStoreModule>();
const mockActiveRoundHelper = mock<typeof ActiveRoundHelper>();
const mockGenerateId = mock<typeof GenerateId>();
jest.mock('../matchStore', () => mockMatchStoreModule);
jest.mock('../activeRoundHelper', () => mockActiveRoundHelper);
jest.mock('../../../helpers/generateId', () => mockGenerateId);

import '../activeRound';

describe('activeRound', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe('swapColorsInternally', () => {
        it('swaps colors on change', () => {
            replicants.activeRound = {
                teamA: { color: 'Team A Color' },
                teamB: { color: 'Team B Color' }
            };

            replicantChangeListeners.swapColorsInternally(true, false);

            const activeRound = replicants.activeRound as ActiveRound;
            expect(activeRound.teamA.color).toBe('Team B Color');
            expect(activeRound.teamB.color).toBe('Team A Color');
        });

        it('does nothing when the old value is missing', () => {
            const activeRoundValue = {
                teamA: {
                    color: 'Team A Color'
                },
                teamB: {
                    color: 'Team B Color'
                }
            };
            replicants.activeRound = activeRoundValue;

            replicantChangeListeners.swapColorsInternally(true, undefined);

            expect(replicants.activeRound).toEqual(activeRoundValue);
        });
    });

    describe('removeWinner', () => {
        it('tries to remove the last winner', () => {
            replicants.activeRound = {
                games: [
                    { winner: GameWinner.BRAVO },
                    { winner: GameWinner.ALPHA },
                    { winner: GameWinner.BRAVO },
                    { winner: GameWinner.BRAVO },
                    { winner: GameWinner.ALPHA },
                    { winner: GameWinner.NO_WINNER },
                    { winner: GameWinner.NO_WINNER },
                ]
            };

            messageListeners.removeWinner();

            expect(mockActiveRoundHelper.setWinner).toHaveBeenCalledWith(4, GameWinner.NO_WINNER);
        });

        it('removes the last winner if rounds were not played in order', () => {
            replicants.activeRound = {
                teamA: {
                    score: 0
                },
                teamB: {
                    score: 1
                },
                games: [
                    { winner: GameWinner.NO_WINNER },
                    { winner: GameWinner.NO_WINNER },
                    { winner: GameWinner.BRAVO }
                ]
            };

            messageListeners.removeWinner();

            expect(mockActiveRoundHelper.setWinner).toHaveBeenCalledWith(2, GameWinner.NO_WINNER);
        });

        it('sends a callback when setWinner throws an error', () => {
            replicants.activeRound = {
                games: [
                    { winner: GameWinner.ALPHA },
                    { winner: GameWinner.BRAVO },
                    { winner: GameWinner.ALPHA },
                    { winner: GameWinner.NO_WINNER },
                    { winner: GameWinner.NO_WINNER },
                ]
            };
            const ack = jest.fn();
            const error = new Error();
            mockActiveRoundHelper.setWinner.mockImplementation(() => { throw error; });

            messageListeners.removeWinner(undefined, ack);

            expect(mockActiveRoundHelper.setWinner).toHaveBeenCalledWith(2, GameWinner.NO_WINNER);
            expect(ack).toHaveBeenCalledWith(error);
        });
    });

    describe('setWinner', () => {
        it('sets the winner for the given index if given', () => {
            replicants.activeRound = {
                teamA: { score: 1 },
                teamB: { score: 3 }
            };

            messageListeners.setWinner({ roundIndex: 2, winner: GameWinner.BRAVO });

            expect(mockActiveRoundHelper.setWinner).toHaveBeenCalledWith(2, GameWinner.BRAVO);
        });

        it('sets the winner for the latest match if index is not given', () => {
            replicants.activeRound = {
                teamA: { score: 3 },
                teamB: { score: 0 }
            };

            messageListeners.setWinner({ winner: GameWinner.ALPHA });

            expect(mockActiveRoundHelper.setWinner).toHaveBeenCalledWith(3, GameWinner.ALPHA);
        });

        it('sends a callback when setWinner throws an error', () => {
            replicants.activeRound = {
                teamA: { score: 0 },
                teamB: { score: 0 }
            };
            const ack = jest.fn();
            const error = new Error();
            mockActiveRoundHelper.setWinner.mockImplementation(() => { throw error; });

            messageListeners.setWinner({ winner: GameWinner.BRAVO }, ack);

            expect(mockActiveRoundHelper.setWinner).toHaveBeenCalledWith(0, GameWinner.BRAVO);
            expect(ack).toHaveBeenCalledWith(error);
        });
    });

    describe('setActiveRound', () => {
        beforeEach(() => {
            replicants.activeRound = { match: { name: 'cool match' } };
        });

        it('sets team data and updates round store data', () => {
            messageListeners.setActiveRound({ teamAId: '123123', teamBId: '456456' });

            expect(mockActiveRoundHelper.setActiveRoundTeams).toHaveBeenCalledWith({ match: { name: 'cool match' } }, '123123', '456456');
            expect(mockActiveRoundHelper.setActiveRoundGames).not.toHaveBeenCalled();
            expect(mockMatchStoreModule.commitActiveRoundToMatchStore).toHaveBeenCalled();
        });

        it('sets games if match id is given', () => {
            messageListeners.setActiveRound({ teamAId: '1231234', teamBId: '123123', matchId: '234' });

            expect(mockActiveRoundHelper.setActiveRoundTeams).toHaveBeenCalledWith({ match: { name: 'cool match' } }, '1231234', '123123');
            expect(mockActiveRoundHelper.setActiveRoundGames).toHaveBeenCalledWith({ match: { name: 'cool match' } }, '234');
            expect(mockMatchStoreModule.commitActiveRoundToMatchStore).toHaveBeenCalled();
        });

        it('sets match name if it differs from the current one', () => {
            messageListeners.setActiveRound({ teamAId: '1231234', teamBId: '123123', matchId: '234', matchName: 'New Match' });

            expect(replicants.activeRound).toEqual({ match: { name: 'New Match' } });
        });

        it('sends a callback on error', () => {
            const ack = jest.fn();
            const error = new Error();
            mockActiveRoundHelper.setActiveRoundTeams.mockImplementation(() => { throw error; });

            messageListeners.setActiveRound({ teamAId: '123123', teamBId: '456456' }, ack);

            expect(ack).toHaveBeenCalledWith(error);
        });
    });

    describe('resetActiveRound', () => {
        it('resets activeRound data and commits it to the store', () => {
            replicants.activeRound = {
                teamA: { score: 100 },
                teamB: { score: 10 },
                games: [
                    {
                        stage: 'Blackbelly Skatepark',
                        mode: 'Rainmaker',
                        winner: GameWinner.BRAVO,
                        color: { name: 'Cool Color' }
                    },
                    {
                        stage: 'MakoMart',
                        mode: 'Clam Blitz',
                        winner: GameWinner.ALPHA,
                        color: { name: 'Cool Color 2' }
                    },
                    {
                        stage: 'Manta Maria',
                        mode: 'Tower Control',
                        winner: GameWinner.NO_WINNER,
                        color: { name: 'Cool Color 3' }
                    }
                ]
            };

            messageListeners.resetActiveRound();

            expect(replicants.activeRound).toEqual({
                teamA: { score: 0 },
                teamB: { score: 0 },
                games: [
                    {
                        stage: 'Blackbelly Skatepark',
                        mode: 'Rainmaker',
                        winner: GameWinner.NO_WINNER,
                        color: undefined
                    },
                    {
                        stage: 'MakoMart',
                        mode: 'Clam Blitz',
                        winner: GameWinner.NO_WINNER,
                        color: undefined
                    },
                    {
                        stage: 'Manta Maria',
                        mode: 'Tower Control',
                        winner: GameWinner.NO_WINNER,
                        color: undefined
                    }
                ]
            });
            expect(mockMatchStoreModule.commitActiveRoundToMatchStore).toHaveBeenCalled();
        });
    });

    describe('updateActiveGames', () => {
        it('updates active games and commits them to the store', () => {
            replicants.activeRound = {
                games: [ ]
            };

            const newGames = [{ stage: 'MakoMart', mode: 'Rainmaker' }];

            messageListeners.updateActiveGames({ games: newGames });

            expect(replicants.activeRound).toEqual({ games: newGames });
            expect(mockMatchStoreModule.commitActiveRoundToMatchStore).toHaveBeenCalled();
        });
    });

    describe('beginNextMatch', () => {
        it('returns error when no arguments are given', () => {
            replicants.activeRound = {};
            const ack = jest.fn();

            messageListeners.beginNextMatch(null, ack);

            expect(ack).toHaveBeenCalledWith(new Error('Match name must not be blank'));
            expect(replicants.activeRound).toEqual({});
        });

        it('returns error when no match name is given', () => {
            replicants.activeRound = {};
            const ack = jest.fn();

            messageListeners.beginNextMatch({ }, ack);

            expect(ack).toHaveBeenCalledWith(new Error('Match name must not be blank'));
            expect(replicants.activeRound).toEqual({});
        });

        it('replaces active teams with next teams and commits them to a new match', () => {
            mockGenerateId.generateId.mockReturnValue('new match id');
            replicants.nextRound = {
                teamA: { id: '123123', testCustomProp: 'hello :)', name: 'Team Three' },
                teamB: { id: '345354', testCustomProp2: 'hello! ;)', name: 'Team Four' },
                games: [
                    { stage: 'MakoMart', mode: 'Rainmaker' },
                    { stage: 'Manta Maria', mode: 'Tower Control' }
                ],
                round: {
                    name: 'Cool Next Round',
                    type: PlayType.PLAY_ALL
                },
                showOnStream: true
            };
            replicants.activeRound = {
                teamA: { name: 'Team One', score: 99, foo: 'bar', color: '#222' },
                teamB: { name: 'Team Two', score: 98, yee: 'haw', color: '#333' }
            };

            messageListeners.beginNextMatch({ matchName: 'Cool Match' });

            expect(replicants.activeRound).toEqual({
                teamA: { id: '123123', name: 'Team Three', score: 0, testCustomProp: 'hello :)', color: '#222' },
                teamB: { id: '345354', name: 'Team Four', score: 0, testCustomProp2: 'hello! ;)', color: '#333' },
                games: [
                    { stage: 'MakoMart', mode: 'Rainmaker', winner: GameWinner.NO_WINNER, color: undefined },
                    { stage: 'Manta Maria', mode: 'Tower Control', winner: GameWinner.NO_WINNER, color: undefined }
                ],
                match: {
                    name: 'Cool Match',
                    id: 'new match id',
                    isCompleted: false,
                    type: PlayType.PLAY_ALL
                }
            });
            expect(mockMatchStoreModule.commitActiveRoundToMatchStore).toHaveBeenCalled();
            expect((replicants.nextRound as NextRound).showOnStream).toEqual(false);
        });
    });

    describe('setActiveColor', () => {
        it('sets active color', () => {
            replicants.activeRound = {
                activeColor: { title: 'Old Color' },
                teamA: { color: '#234' },
                teamB: { color: '#345' }
            };

            messageListeners.setActiveColor({
                categoryName: 'Cool Colors',
                color: {
                    index: 2,
                    title: 'Green vs Blue',
                    clrA: '#567',
                    clrB: '#fff'
                }
            });

            expect(replicants.activeRound).toEqual({
                activeColor: {
                    categoryName: 'Cool Colors',
                    index: 2,
                    title: 'Green vs Blue'
                },
                teamA: { color: '#567' },
                teamB: { color: '#fff' }
            });
        });
    });

    describe('swapRoundColor', () => {
        it('swaps colors for given round', () => {
            replicants.activeRound = {
                games: [
                    { color: { clrA: '#123', clrB: '#234', colorsSwapped: false, title: 'Cool Color' } }
                ]
            };

            messageListeners.swapRoundColor({ roundIndex: 0, colorsSwapped: true });

            expect((replicants.activeRound as ActiveRound).games[0].color).toEqual({
                clrA: '#234',
                clrB: '#123',
                colorsSwapped: true,
                title: 'Cool Color'
            });
        });

        it('does not swap colors if round has no color saved', () => {
            const activeRound = {
                games: [
                    { color: { clrA: '#123', clrB: '#234', colorsSwapped: false, title: 'Cool Color' } },
                    { color: undefined }
                ]
            };
            replicants.activeRound = activeRound;

            messageListeners.swapRoundColor({ roundIndex: 1, colorsSwapped: true });

            expect(replicants.activeRound).toEqual(activeRound);
        });

        it('does not swap colors if request colorsSwapped matches value for saved game', () => {
            const activeRound = {
                games: [
                    { color: { clrA: '#123', clrB: '#234', colorsSwapped: true, title: 'Cool Color' } }
                ]
            };
            replicants.activeRound = activeRound;

            messageListeners.swapRoundColor({ roundIndex: 0, colorsSwapped: true });

            expect(replicants.activeRound).toEqual(activeRound);
        });
    });
});
