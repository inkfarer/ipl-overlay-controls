import MatchManager from '../matchManager.vue';
import { config, mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import { ObsStatus } from 'types/enums/ObsStatus';
import { casterStoreKey } from '../../store/casterStore';
import { obsStoreKey } from '../../store/obsStore';
import { messageListeners } from '../../__mocks__/mockNodecg';

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

    function createCasterStore() {
        return createStore({
            actions: {
                showCasters: jest.fn()
            }
        });
    }

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
        const casterStore = createCasterStore();
        const obsStore = createObsStore();
        obsStore.state.obsData.status = status;
        const wrapper = mount(MatchManager, {
            global: {
                plugins: [
                    [casterStore, casterStoreKey],
                    [obsStore, obsStoreKey]
                ]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('handles showing casters', () => {
        const casterStore = createCasterStore();
        jest.spyOn(casterStore, 'dispatch');
        const obsStore = createObsStore();
        const wrapper = mount(MatchManager, {
            global: {
                plugins: [
                    [casterStore, casterStoreKey],
                    [obsStore, obsStoreKey]
                ]
            }
        });

        wrapper.getComponent('[data-test="show-casters-button"]').vm.$emit('click');

        expect(casterStore.dispatch).toHaveBeenCalledWith('showCasters');
    });

    it('disables showing casters when message to show casters is received from nodecg and enables it after a delay', async () => {
        jest.useFakeTimers();
        const casterStore = createCasterStore();
        jest.spyOn(casterStore, 'dispatch');
        const obsStore = createObsStore();
        const wrapper = mount(MatchManager, {
            global: {
                plugins: [
                    [casterStore, casterStoreKey],
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
        const casterStore = createCasterStore();
        const obsStore = createObsStore();
        jest.spyOn(obsStore, 'dispatch');
        const wrapper = mount(MatchManager, {
            global: {
                plugins: [
                    [casterStore, casterStoreKey],
                    [obsStore, obsStoreKey]
                ]
            }
        });

        wrapper.getComponent('[data-test="start-game-button"]').vm.$emit('click');

        expect(obsStore.dispatch).toHaveBeenCalledWith('startGame');
    });

    it('handles ending a game', () => {
        const casterStore = createCasterStore();
        const obsStore = createObsStore();
        jest.spyOn(obsStore, 'dispatch');
        const wrapper = mount(MatchManager, {
            global: {
                plugins: [
                    [casterStore, casterStoreKey],
                    [obsStore, obsStoreKey]
                ]
            }
        });

        wrapper.getComponent('[data-test="end-game-button"]').vm.$emit('click');

        expect(obsStore.dispatch).toHaveBeenCalledWith('endGame');
    });
});
