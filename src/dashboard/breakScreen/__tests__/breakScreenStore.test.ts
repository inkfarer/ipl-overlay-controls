import { breakScreenStore } from '../breakScreenStore';
import { replicants } from '../../../browser/__mocks__/mockNodecg';
import { NextRoundStartTime } from 'schemas';

describe('breakScreenStore', () => {
    describe('setState', () => {
        it('updates state', () => {
            breakScreenStore.commit('setState', { name: 'mainFlavorText', val: 'new value' });

            expect(breakScreenStore.state.mainFlavorText).toEqual('new value');
        });
    });

    describe('setActiveBreakScene', () => {
        it('updates replicant value', () => {
            breakScreenStore.commit('setActiveBreakScene', 'teams');

            expect(replicants.activeBreakScene).toEqual('teams');
        });
    });

    describe('setMainFlavorText', () => {
        it('updates replicant value', () => {
            breakScreenStore.commit('setMainFlavorText', 'hello!');

            expect(replicants.mainFlavorText).toEqual('hello!');
        });
    });

    describe('setNextRoundStartTimeVisible', () => {
        it('updates replicant value', () => {
            replicants.nextRoundStartTime = { isVisible: null };

            breakScreenStore.commit('setNextRoundStartTimeVisible', true);

            expect((replicants.nextRoundStartTime as NextRoundStartTime).isVisible).toEqual(true);
        });
    });

    describe('setNextRoundStartTime', () => {
        it('updates replicant value', () => {
            replicants.nextRoundStartTime = { startTime: null };

            breakScreenStore.commit('setNextRoundStartTime', '2020-01-05');

            expect((replicants.nextRoundStartTime as NextRoundStartTime).startTime).toEqual('2020-01-05');
        });
    });
});
