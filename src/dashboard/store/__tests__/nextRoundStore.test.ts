import { useNextRoundStore } from '../nextRoundStore';
import { mockSendMessage, replicants } from '../../__mocks__/mockNodecg';
import { NextRound } from 'schemas';
import { createPinia, setActivePinia } from 'pinia';

describe('nextRoundStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('setNextRound', () => {
        it('sends message to extension', () => {
            const store = useNextRoundStore();

            store.setNextRound({ teamAId: '123123', teamBId: '456456', roundId: '340857' });

            expect(mockSendMessage).toHaveBeenCalledWith('setNextRound',
                { teamAId: '123123', teamBId: '456456', roundId: '340857' });
        });
    });

    describe('setShowOnStream', () => {
        it('updates replicant value', () => {
            replicants.nextRound = { showOnStream: false };
            const store = useNextRoundStore();

            store.setShowOnStream(true);

            expect((replicants.nextRound as NextRound).showOnStream).toEqual(true);
        });
    });

    describe('beginNextMatch', () => {
        it('sends message to extension', () => {
            const store = useNextRoundStore();

            store.beginNextMatch({ matchName: 'cool match' });

            expect(mockSendMessage).toHaveBeenCalledWith('beginNextMatch', { matchName: 'cool match' });
        });
    });
});
