import { useBreakScreenStore } from '../breakScreenStore';
import { replicants } from '../../__mocks__/mockNodecg';
import { NextRoundStartTime } from 'schemas';
import { createPinia, setActivePinia } from 'pinia';

describe('breakScreenStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('setActiveBreakScene', () => {
        it('updates replicant value', () => {
            const store = useBreakScreenStore();

            store.setActiveBreakScene('teams');

            expect(replicants.activeBreakScene).toEqual('teams');
        });
    });

    describe('setMainFlavorText', () => {
        it('updates replicant value', () => {
            const store = useBreakScreenStore();

            store.setMainFlavorText('hello!');

            expect(replicants.mainFlavorText).toEqual('hello!');
        });
    });

    describe('setNextRoundStartTimeVisible', () => {
        it('updates replicant value', () => {
            replicants.nextRoundStartTime = { isVisible: null };
            const store = useBreakScreenStore();

            store.setNextRoundStartTimeVisible(true);

            expect((replicants.nextRoundStartTime as NextRoundStartTime).isVisible).toEqual(true);
        });
    });

    describe('setNextRoundStartTime', () => {
        it('updates replicant value', () => {
            replicants.nextRoundStartTime = { startTime: null };
            const store = useBreakScreenStore();

            store.setNextRoundStartTime('2020-01-05');

            expect((replicants.nextRoundStartTime as NextRoundStartTime).startTime).toEqual('2020-01-05');
        });
    });
});
