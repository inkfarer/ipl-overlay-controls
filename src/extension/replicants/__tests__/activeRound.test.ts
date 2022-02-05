import { MockNodecg } from '../../__mocks__/mockNodecg';
import { ActiveRound, NextRound } from 'schemas';
import { GameWinner } from 'types/enums/gameWinner';

describe('activeRound', () => {
    let nodecg: MockNodecg;
    const mockCommitActiveRound = jest.fn();
    const mockSetWinner = jest.fn();
    const mockSetActiveRoundTeams = jest.fn();
    const mockSetActiveRoundGames = jest.fn();
    const mockGenerateId = jest.fn();

    jest.mock('../roundStore', () => ({
        __esModule: true,
        commitActiveRoundToMatchStore: mockCommitActiveRound
    }));

    jest.mock('../activeRoundHelper', () => ({
        __esModule: true,
        setWinner: mockSetWinner,
        setActiveRoundTeams: mockSetActiveRoundTeams,
        setActiveRoundGames: mockSetActiveRoundGames
    }));

    jest.mock('../../../helpers/generateId', () => ({
        __esModule: true,
        generateId: mockGenerateId
    }));

    beforeEach(() => {
        jest.resetAllMocks();
        jest.resetModules();
        nodecg = new MockNodecg();
        nodecg.init();

        require('../activeRound');
    });

    describe('swapColorsInternally', () => {
        it('swaps colors on change', () => {
            nodecg.replicants.activeRound.value = {
                teamA: { color: 'Team A Color' },
                teamB: { color: 'Team B Color' }
            };

            nodecg.replicantListeners.swapColorsInternally(true, false);

            const activeRound = nodecg.replicants.activeRound.value as ActiveRound;
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
            nodecg.replicants.activeRound.value = activeRoundValue;

            nodecg.replicantListeners.swapColorsInternally(true, undefined);

            expect(nodecg.replicants.activeRound.value).toEqual(activeRoundValue);
        });
    });

    describe('removeWinner', () => {
        it('tries to remove the last winner', () => {
            nodecg.replicants.activeRound.value = {
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

            nodecg.messageListeners.removeWinner();

            expect(mockSetWinner).toHaveBeenCalledWith(4, GameWinner.NO_WINNER);
        });

        it('removes the last winner if rounds were not played in order', () => {
            nodecg.replicants.activeRound.value = {
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

            nodecg.messageListeners.removeWinner();

            expect(mockSetWinner).toHaveBeenCalledWith(2, GameWinner.NO_WINNER);
        });

        it('sends a callback when setWinner throws an error', () => {
            nodecg.replicants.activeRound.value = {
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
            mockSetWinner.mockImplementation(() => { throw error; });

            nodecg.messageListeners.removeWinner(undefined, ack);

            expect(mockSetWinner).toHaveBeenCalledWith(2, GameWinner.NO_WINNER);
            expect(ack).toHaveBeenCalledWith(error);
        });
    });

    describe('setWinner', () => {
        it('sets the winner for the given index if given', () => {
            nodecg.replicants.activeRound.value = {
                teamA: { score: 1 },
                teamB: { score: 3 }
            };

            nodecg.messageListeners.setWinner({ roundIndex: 2, winner: GameWinner.BRAVO });

            expect(mockSetWinner).toHaveBeenCalledWith(2, GameWinner.BRAVO);
        });

        it('sets the winner for the latest match if index is not given', () => {
            nodecg.replicants.activeRound.value = {
                teamA: { score: 3 },
                teamB: { score: 0 }
            };

            nodecg.messageListeners.setWinner({ winner: GameWinner.ALPHA });

            expect(mockSetWinner).toHaveBeenCalledWith(3, GameWinner.ALPHA);
        });

        it('sends a callback when setWinner throws an error', () => {
            nodecg.replicants.activeRound.value = {
                teamA: { score: 0 },
                teamB: { score: 0 }
            };
            const ack = jest.fn();
            const error = new Error();
            mockSetWinner.mockImplementation(() => { throw error; });

            nodecg.messageListeners.setWinner({ winner: GameWinner.BRAVO }, ack);

            expect(mockSetWinner).toHaveBeenCalledWith(0, GameWinner.BRAVO);
            expect(ack).toHaveBeenCalledWith(error);
        });
    });

    describe('setActiveRound', () => {
        it('sets team data and updates round store data', () => {
            nodecg.messageListeners.setActiveRound({ teamAId: '123123', teamBId: '456456' });

            expect(mockSetActiveRoundTeams).toHaveBeenCalledWith('123123', '456456');
            expect(mockCommitActiveRound).toHaveBeenCalled();
        });

        it('sets games if match id is given', () => {
            nodecg.messageListeners.setActiveRound({ teamAId: '1231234', teamBId: '123123', matchId: '234' });

            expect(mockSetActiveRoundTeams).toHaveBeenCalledWith('1231234', '123123');
            expect(mockSetActiveRoundGames).toHaveBeenCalledWith('234');
            expect(mockCommitActiveRound).toHaveBeenCalled();
        });

        it('sends a callback on error', () => {
            const ack = jest.fn();
            const error = new Error();
            mockSetActiveRoundTeams.mockImplementation(() => { throw error; });

            nodecg.messageListeners.setActiveRound({ teamAId: '123123', teamBId: '456456' }, ack);

            expect(ack).toHaveBeenCalledWith(error);
        });
    });

    describe('resetActiveRound', () => {
        it('resets activeRound data and commits it to the store', () => {
            nodecg.replicants.activeRound.value = {
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

            nodecg.messageListeners.resetActiveRound();

            expect(nodecg.replicants.activeRound.value).toEqual({
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
            expect(mockCommitActiveRound).toHaveBeenCalled();
        });
    });

    describe('updateActiveGames', () => {
        it('updates active games and commits them to the store', () => {
            nodecg.replicants.activeRound.value = {
                games: [ ]
            };

            const newGames = [{ stage: 'MakoMart', mode: 'Rainmaker' }];

            nodecg.messageListeners.updateActiveGames({ games: newGames });

            expect(nodecg.replicants.activeRound.value).toEqual({ games: newGames });
            expect(mockCommitActiveRound).toHaveBeenCalled();
        });
    });

    describe('beginNextMatch', () => {
        it('replaces active teams with next teams and commits them to a new match', () => {
            mockGenerateId.mockReturnValue('new match id');
            nodecg.replicants.nextRound.value = {
                teamA: { id: '123123', testCustomProp: 'hello :)', name: 'Team Three' },
                teamB: { id: '345354', testCustomProp2: 'hello! ;)', name: 'Team Four' },
                games: [
                    { stage: 'MakoMart', mode: 'Rainmaker' },
                    { stage: 'Manta Maria', mode: 'Tower Control' }
                ],
                round: {
                    name: 'Cool Next Round'
                },
                showOnStream: true
            };
            nodecg.replicants.activeRound.value = {
                teamA: { name: 'Team One', score: 99, foo: 'bar', color: '#222' },
                teamB: { name: 'Team Two', score: 98, yee: 'haw', color: '#333' }
            };

            nodecg.messageListeners.beginNextMatch();

            expect(nodecg.replicants.activeRound.value).toEqual({
                teamA: { id: '123123', name: 'Team Three', score: 0, testCustomProp: 'hello :)', color: '#222' },
                teamB: { id: '345354', name: 'Team Four', score: 0, testCustomProp2: 'hello! ;)', color: '#333' },
                games: [
                    { stage: 'MakoMart', mode: 'Rainmaker', winner: GameWinner.NO_WINNER, color: undefined },
                    { stage: 'Manta Maria', mode: 'Tower Control', winner: GameWinner.NO_WINNER, color: undefined }
                ],
                round: {
                    name: 'Cool Next Round'
                },
                match: {
                    name: 'Cool Next Round',
                    id: 'new match id',
                    isCompleted: false
                }
            });
            expect(mockCommitActiveRound).toHaveBeenCalled();
            expect((nodecg.replicants.nextRound.value as NextRound).showOnStream).toEqual(false);
        });
    });

    describe('setActiveColor', () => {
        it('sets active color', () => {
            nodecg.replicants.activeRound.value = {
                activeColor: { title: 'Old Color' },
                teamA: { color: '#234' },
                teamB: { color: '#345' }
            };

            nodecg.messageListeners.setActiveColor({
                categoryName: 'Cool Colors',
                color: {
                    index: 2,
                    title: 'Green vs Blue',
                    clrA: '#567',
                    clrB: '#fff'
                }
            });

            expect(nodecg.replicants.activeRound.value).toEqual({
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
            nodecg.replicants.activeRound.value = {
                games: [
                    { color: { clrA: '#123', clrB: '#234', colorsSwapped: false, title: 'Cool Color' } }
                ]
            };

            nodecg.messageListeners.swapRoundColor({ roundIndex: 0, colorsSwapped: true });

            expect((nodecg.replicants.activeRound.value as ActiveRound).games[0].color).toEqual({
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
            nodecg.replicants.activeRound.value = activeRound;

            nodecg.messageListeners.swapRoundColor({ roundIndex: 1, colorsSwapped: true });

            expect(nodecg.replicants.activeRound.value).toEqual(activeRound);
        });

        it('does not swap colors if request colorsSwapped matches value for saved game', () => {
            const activeRound = {
                games: [
                    { color: { clrA: '#123', clrB: '#234', colorsSwapped: true, title: 'Cool Color' } }
                ]
            };
            nodecg.replicants.activeRound.value = activeRound;

            nodecg.messageListeners.swapRoundColor({ roundIndex: 0, colorsSwapped: true });

            expect(nodecg.replicants.activeRound.value).toEqual(activeRound);
        });
    });
});
