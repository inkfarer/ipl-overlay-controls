import MatchManager from '../matchManager.vue';
import { config, mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import { ObsStatus } from 'types/enums/ObsStatus';
import { obsStoreKey } from '../../store/obsStore';
import { messageListeners } from '../../__mocks__/mockNodecg';
import { useCasterStore } from '../../store/casterStore';
import { createTestingPinia } from '@pinia/testing';

describe('MatchManager', () => {
    config.global.stubs = {
        NextMatchStarter: true,
        IplErrorDisplay: true,
        ScoreboardEditor: true,
        IplButton: true,
        ActiveColorToggles: true,
        IplExpandingSpaceGroup: true,
        ColorEditor: true,
        ActiveMatchEditor: true,
        ScoreDisplay: true,
        SetEditor: true,
        FontAwesomeIcon: true,
        ActiveRosterDisplay: true
    };

    function createObsStore() {
        return createStore({
            state: {
                obsData: {
                    status: ObsStatus.CONNECTED
                }
            },
            actions: {
                startGame: jest.fn(),
                endGame: jest.fn()
            }
        });
    }

    it.each(Object.values(ObsStatus))('matches snapshot if obs status is %s', status => {
        const pinia = createTestingPinia();
        const obsStore = createObsStore();
        obsStore.state.obsData.status = status;
        const wrapper = mount(MatchManager, {
            global: {
                plugins: [
                    [pinia],
                    [obsStore, obsStoreKey]
                ]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('handles showing casters', () => {
        const pinia = createTestingPinia();
        const casterStore = useCasterStore();
        jest.spyOn(casterStore, 'showCasters');
        const obsStore = createObsStore();
        const wrapper = mount(MatchManager, {
            global: {
                plugins: [
                    [pinia],
                    [obsStore, obsStoreKey]
                ]
            }
        });

        wrapper.getComponent('[data-test="show-casters-button"]').vm.$emit('click');

        expect(casterStore.showCasters).toHaveBeenCalled();
    });

    it('disables showing casters when message to show casters is received from nodecg and enables it after a delay', async () => {
        const pinia = createTestingPinia();
        jest.useFakeTimers();
        const obsStore = createObsStore();
        const wrapper = mount(MatchManager, {
            global: {
                plugins: [
                    [pinia],
                    [obsStore, obsStoreKey]
                ]
            }
        });

        messageListeners.mainShowCasters();
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="show-casters-button"]').attributes().disabled).toEqual('true');

        jest.advanceTimersByTime(5000);
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="show-casters-button"]').attributes().disabled).toEqual('false');

        jest.useRealTimers();
    });

    it('handles starting a game', () => {
        const pinia = createTestingPinia();
        const obsStore = createObsStore();
        jest.spyOn(obsStore, 'dispatch');
        const wrapper = mount(MatchManager, {
            global: {
                plugins: [
                    [pinia],
                    [obsStore, obsStoreKey]
                ]
            }
        });

        wrapper.getComponent('[data-test="start-game-button"]').vm.$emit('click');

        expect(obsStore.dispatch).toHaveBeenCalledWith('startGame');
    });

    it('handles ending a game', () => {
        const pinia = createTestingPinia();
        const obsStore = createObsStore();
        jest.spyOn(obsStore, 'dispatch');
        const wrapper = mount(MatchManager, {
            global: {
                plugins: [
                    [pinia],
                    [obsStore, obsStoreKey]
                ]
            }
        });

        wrapper.getComponent('[data-test="end-game-button"]').vm.$emit('click');

        expect(obsStore.dispatch).toHaveBeenCalledWith('endGame');
    });
});
