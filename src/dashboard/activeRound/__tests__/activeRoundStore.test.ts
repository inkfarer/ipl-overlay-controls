import { activeRoundStore } from '../activeRoundStore';
import { GameWinner } from 'types/enums/gameWinner';
import { mockSendMessage, replicants } from '../../__mocks__/mockNodecg';

describe('activeRoundStore', () => {
    describe('setState', () => {
        it('updates state', () => {
            activeRoundStore.commit('setState', { name: 'activeRound', val: { foo: 'bar' } });

            expect(activeRoundStore.state.activeRound).toEqual({ foo: 'bar' });
        });
    });

    describe('setWinner', () => {
        it('sends message to extension', () => {
            activeRoundStore.dispatch('setWinner', { winner: GameWinner.ALPHA });

            expect(mockSendMessage).toHaveBeenCalledWith('setWinner', { winner: GameWinner.ALPHA });
        });
    });

    describe('removeWinner', () => {
        it('sends message to extension', () => {
            activeRoundStore.dispatch('removeWinner');

            expect(mockSendMessage).toHaveBeenCalledWith('removeWinner');
        });
    });

    describe('setActiveColor', () => {
        it('sends message to extension', () => {
            activeRoundStore.dispatch('setActiveColor', {
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

            activeRoundStore.dispatch('swapColors');

            expect(replicants.swapColorsInternally).toEqual(false);
        });
    });

    describe('setActiveRound', () => {
        it('sends message to extension', () => {
            activeRoundStore.commit('setActiveRound', {
                teamAId: 'teama123',
                teamBId: 'teamb234',
                roundId: 'round2'
            });

            expect(mockSendMessage).toHaveBeenCalledWith('setActiveRound', {
                teamAId: 'teama123',
                teamBId: 'teamb234',
                roundId: 'round2'
            });
        });
    });
});
