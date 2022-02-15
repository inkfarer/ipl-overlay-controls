import { nextRoundStore } from '../nextRoundStore';
import { mockSendMessage, replicants } from '../../../browser/__mocks__/mockNodecg';
import { NextRound } from 'schemas';

describe('nextRoundStore', () => {
    describe('setState', () => {
        it('updates state', () => {
            nextRoundStore.commit('setState', { name: 'nextRound', val: { foo: 'bar' } });

            expect(nextRoundStore.state.nextRound).toEqual({ foo: 'bar' });
        });
    });

    describe('setNextRound', () => {
        it('sends message to extension', () => {
            nextRoundStore.dispatch('setNextRound', { teamAId: '123123', teamBId: '456456', roundId: '340857' });

            expect(mockSendMessage).toHaveBeenCalledWith('setNextRound',
                { teamAId: '123123', teamBId: '456456', roundId: '340857' });
        });
    });

    describe('setShowOnStream', () => {
        it('updates replicant value', () => {
            replicants.nextRound = { showOnStream: false };
            nextRoundStore.commit('setShowOnStream', true);

            expect((replicants.nextRound as NextRound).showOnStream).toEqual(true);
        });
    });

    describe('beginNextMatch', () => {
        it('sends message to extension', () => {
            nextRoundStore.dispatch('beginNextMatch', { matchName: 'cool match' });

            expect(mockSendMessage).toHaveBeenCalledWith('beginNextMatch', { matchName: 'cool match' });
        });
    });
});
