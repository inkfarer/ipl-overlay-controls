import { GameWinner } from 'types/enums/gameWinner';
import { mockSendMessage, replicants } from '../../__mocks__/mockNodecg';
import { createPinia, setActivePinia } from 'pinia';
import { useActiveRoundStore } from '../activeRoundStore';

describe('activeRoundStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('setWinner', () => {
        it('sends message to extension', () => {
            const store = useActiveRoundStore();

            store.setWinner({ winner: GameWinner.ALPHA });

            expect(mockSendMessage).toHaveBeenCalledWith('setWinner', { winner: GameWinner.ALPHA });
        });
    });

    describe('removeWinner', () => {
        it('sends message to extension', () => {
            const store = useActiveRoundStore();

            store.removeWinner();

            expect(mockSendMessage).toHaveBeenCalledWith('removeWinner');
        });
    });

    describe('setActiveColor', () => {
        it('sends message to extension', () => {
            const store = useActiveRoundStore();

            store.setActiveColor({
                // @ts-ignore
                color: {
                    clrA: '#123',
                    clrB: '#456'
                },
                categoryName: 'cool colors'
            });

            expect(mockSendMessage).toHaveBeenCalledWith('setActiveColor', {
                color: {
                    clrA: '#123',
                    clrB: '#456'
                },
                categoryName: 'cool colors'
            });
        });
    });

    describe('swapColors', () => {
        it('updates replicant value', () => {
            replicants.swapColorsInternally = true;
            const store = useActiveRoundStore();

            store.swapColors();

            expect(replicants.swapColorsInternally).toEqual(false);
        });
    });

    describe('setActiveRound', () => {
        it('sends message to extension', () => {
            const store = useActiveRoundStore();

            store.setActiveRound({
                teamAId: 'teama123',
                teamBId: 'teamb234',
                matchId: 'round2',
                matchName: 'Cool Match'
            });

            expect(mockSendMessage).toHaveBeenCalledWith('setActiveRound', {
                teamAId: 'teama123',
                teamBId: 'teamb234',
                matchId: 'round2',
                matchName: 'Cool Match'
            });
        });
    });

    describe('swapRoundColor', () => {
        it('sends message to extension', () => {
            const store = useActiveRoundStore();

            store.swapRoundColor({ roundIndex: 100, colorsSwapped: true });

            expect(mockSendMessage).toHaveBeenCalledWith('swapRoundColor', { roundIndex: 100, colorsSwapped: true });
        });
    });

    describe('updateActiveGames', () => {
        it('sends message to extension', () => {
            const store = useActiveRoundStore();

            // @ts-ignore
            store.updateActiveGames([ { foo: 'bar' }, { biz: 'boz' } ]);

            expect(mockSendMessage).toHaveBeenCalledWith('updateActiveGames', {
                games: [ { foo: 'bar' }, { biz: 'boz' } ]
            });
        });
    });

    describe('setWinnerForIndex', () => {
        it('sends message to extension', () => {
            const store = useActiveRoundStore();

            store.setWinnerForIndex({ index: 50, winner: GameWinner.ALPHA });

            expect(mockSendMessage).toHaveBeenCalledWith('setWinner', { roundIndex: 50, winner: GameWinner.ALPHA });
        });
    });

    describe('resetActiveRound', () => {
        it('sends message to extension', () => {
            const store = useActiveRoundStore();

            store.resetActiveRound();

            expect(mockSendMessage).toHaveBeenCalledWith('resetActiveRound');
        });
    });
});
