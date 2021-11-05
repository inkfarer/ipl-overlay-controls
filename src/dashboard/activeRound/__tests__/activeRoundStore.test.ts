import { activeRoundStore } from '../activeRoundStore';
import { GameWinner } from 'types/enums/gameWinner';
import { mockSendMessage } from '../../__mocks__/mockNodecg';

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
});
