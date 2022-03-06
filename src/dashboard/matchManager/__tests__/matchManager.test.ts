import MatchManager from '../matchManager.vue';
import { config, mount } from '@vue/test-utils';
import { ObsStatus } from 'types/enums/ObsStatus';
import { messageListeners } from '../../__mocks__/mockNodecg';
import { useCasterStore } from '../../store/casterStore';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { useObsStore } from '../../store/obsStore';

describe('MatchManager', () => {
    let pinia: TestingPinia;

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

    beforeEach(() => {
        pinia = createTestingPinia();

        useObsStore().$state = {
            // @ts-ignore
            obsData: {
                status: ObsStatus.CONNECTED
            }
        };
    });

    it.each(Object.values(ObsStatus))('matches snapshot if obs status is %s', status => {
        const obsStore = useObsStore();
        obsStore.obsData.status = status;
        const wrapper = mount(MatchManager, {
            global: {
                plugins: [
                    [pinia]
                ]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('handles showing casters', () => {
        const casterStore = useCasterStore();
        jest.spyOn(casterStore, 'showCasters');
        const wrapper = mount(MatchManager, {
            global: {
                plugins: [
                    [pinia]
                ]
            }
        });

        wrapper.getComponent('[data-test="show-casters-button"]').vm.$emit('click');

        expect(casterStore.showCasters).toHaveBeenCalled();
    });

    it('disables showing casters when message to show casters is received from nodecg and enables it after a delay', async () => {
        jest.useFakeTimers();
        const wrapper = mount(MatchManager, {
            global: {
                plugins: [
                    [pinia]
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
        const obsStore = useObsStore();
        obsStore.startGame = jest.fn();
        const wrapper = mount(MatchManager, {
            global: {
                plugins: [
                    [pinia]
                ]
            }
        });

        wrapper.getComponent('[data-test="start-game-button"]').vm.$emit('click');

        expect(obsStore.startGame).toHaveBeenCalled();
    });

    it('handles ending a game', () => {
        const obsStore = useObsStore();
        obsStore.endGame = jest.fn();
        const wrapper = mount(MatchManager, {
            global: {
                plugins: [
                    [pinia]
                ]
            }
        });

        wrapper.getComponent('[data-test="end-game-button"]').vm.$emit('click');

        expect(obsStore.endGame).toHaveBeenCalled();
    });
});
