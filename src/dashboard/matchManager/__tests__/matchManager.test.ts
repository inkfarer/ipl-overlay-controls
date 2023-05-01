import MatchManager from '../matchManager.vue';
import { config, mount, VueWrapper } from '@vue/test-utils';
import { ObsStatus } from 'types/enums/ObsStatus';
import { messageListeners, mockSendMessage } from '../../__mocks__/mockNodecg';
import { useCasterStore } from '../../store/casterStore';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { useObsStore } from '../../store/obsStore';
import { GameAutomationAction } from 'types/enums/GameAutomationAction';
import { UnknownModule } from '../../../helpers/__mocks__/module';
import { IplButton, IplMessage } from '@iplsplatoon/vue-components';

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

        config.global.plugins = [pinia];

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
        const wrapper = mount(MatchManager);

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('handles showing casters', () => {
        const casterStore = useCasterStore();
        jest.spyOn(casterStore, 'showCasters');
        const wrapper = mount(MatchManager);

        wrapper.getComponent<typeof IplButton>('[data-test="show-casters-button"]').vm.$emit('click');

        expect(casterStore.showCasters).toHaveBeenCalled();
    });

    it('disables showing casters when message to show casters is received from nodecg and enables it after a delay', async () => {
        jest.useFakeTimers();
        const wrapper = mount(MatchManager);

        messageListeners.mainShowCasters();
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="show-casters-button"]').attributes().disabled).toEqual('true');

        jest.advanceTimersByTime(5000);
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="show-casters-button"]').attributes().disabled).toEqual('false');

        jest.useRealTimers();
    });

    it('does not show button to cancel automation action when no action is in progress', () => {
        const obsStore = useObsStore();
        obsStore.gameAutomationData = {
            actionInProgress: GameAutomationAction.NONE,
            nextTaskForAction: null
        };
        const wrapper = mount(MatchManager);

        expect(wrapper.findComponent('[data-test="cancel-automation-action-button"]').exists()).toEqual(false);
    });

    describe('when automation action is in progress', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let wrapper: VueWrapper<any>;

        beforeEach(() => {
            const obsStore = useObsStore();
            obsStore.gameAutomationData = {
                actionInProgress: GameAutomationAction.START_GAME,
                nextTaskForAction: { name: 'action!!', index: 2, executionTimeMillis: 123123 }
            };
            wrapper = mount(MatchManager);
        });

        it('handles start-stop button press', () => {
            const obsStore = useObsStore();
            obsStore.fastForwardToNextGameAutomationTask = jest.fn();

            wrapper.getComponent<typeof IplButton>('[data-test="start-stop-game-button"]').vm.$emit('click');

            expect(obsStore.fastForwardToNextGameAutomationTask).toHaveBeenCalled();
        });

        it.each(['changeScene', 'showScoreboard', 'hideScoreboard', 'showCasters', 'unknown task'])('has expected button color and label when task name is %s', async (taskName) => {
            useObsStore().gameAutomationData.nextTaskForAction.name = taskName;
            await wrapper.vm.$nextTick();
            const button = wrapper.getComponent<typeof IplButton>('[data-test="start-stop-game-button"]');

            expect((button.vm as unknown as UnknownModule).color).toEqual('blue');
            expect((button.vm as unknown as UnknownModule).label).toMatchSnapshot();
        });

        it('shows button to cancel action', () => {
            expect(wrapper.getComponent('[data-test="cancel-automation-action-button"]').isVisible()).toEqual(true);
        });

        it('handles cancel button press', () => {
            const button = wrapper.getComponent<typeof IplButton>('[data-test="cancel-automation-action-button"]');

            button.vm.$emit('click');

            expect(mockSendMessage).toHaveBeenCalledWith('cancelAutomationAction', undefined);
        });
    });

    describe('when gameplay scene is active', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let wrapper: VueWrapper<any>;

        beforeEach(() => {
            const obsStore = useObsStore();
            obsStore.gameAutomationData = {
                actionInProgress: GameAutomationAction.NONE
            };
            obsStore.obsData.currentScene = 'Gameplay Scene';
            obsStore.obsData.gameplayScene = 'Gameplay Scene';
            wrapper = mount(MatchManager);
        });

        it('handles start-stop button press', () => {
            const obsStore = useObsStore();
            obsStore.endGame = jest.fn();

            wrapper.getComponent<typeof IplButton>('[data-test="start-stop-game-button"]').vm.$emit('click');

            expect(obsStore.endGame).toHaveBeenCalled();
        });

        it('has expected button color and label', () => {
            const button = wrapper.getComponent<typeof IplButton>('[data-test="start-stop-game-button"]');

            expect((button.vm as unknown as UnknownModule).color).toEqual('red');
            expect((button.vm as unknown as UnknownModule).label).toEqual('End Game');
        });
    });

    describe('when gameplay scene is not active', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let wrapper: VueWrapper<any>;

        beforeEach(() => {
            const obsStore = useObsStore();
            obsStore.gameAutomationData = {
                actionInProgress: GameAutomationAction.NONE
            };
            obsStore.obsData.currentScene = 'another scene';
            obsStore.obsData.gameplayScene = 'Gameplay Scene';
            wrapper = mount(MatchManager);
        });

        it('handles start-stop button press', () => {
            const obsStore = useObsStore();
            obsStore.startGame = jest.fn();

            wrapper.getComponent<typeof IplButton>('[data-test="start-stop-game-button"]').vm.$emit('click');

            expect(obsStore.startGame).toHaveBeenCalled();
        });

        it('has expected button color and label', () => {
            const button = wrapper.getComponent<typeof IplButton>('[data-test="start-stop-game-button"]');

            expect((button.vm as unknown as UnknownModule).color).toEqual('green');
            expect((button.vm as unknown as UnknownModule).label).toEqual('Start Game');
        });
    });

    it.each([9001, 9500, 9999, 10000, 11000])('disables completing task when execution time is one second or less from now (now=%s)', async (now) => {
        const obsStore = useObsStore();
        obsStore.gameAutomationData = {
            actionInProgress: GameAutomationAction.START_GAME,
            nextTaskForAction: { name: 'action!!', index: 2, executionTimeMillis: 10000 }
        };
        jest.spyOn(Date.prototype, 'getTime').mockReturnValue(now);
        const wrapper = mount(MatchManager);
        const button = wrapper.getComponent<typeof IplButton>('[data-test="start-stop-game-button"]');

        expect((button.vm as unknown as UnknownModule).disabled).toEqual(true);
    });

    it('enables completing task when execution time is more than one second from now', () => {
        const obsStore = useObsStore();
        obsStore.gameAutomationData = {
            actionInProgress: GameAutomationAction.START_GAME,
            nextTaskForAction: { name: 'action!!', index: 2, executionTimeMillis: 10000 }
        };
        jest.spyOn(Date.prototype, 'getTime').mockReturnValue(8999);
        const wrapper = mount(MatchManager);
        const button = wrapper.getComponent<typeof IplButton>('[data-test="start-stop-game-button"]');

        expect((button.vm as unknown as UnknownModule).disabled).toEqual(false);
    });

    it('does not show scene configuration change warning by default', () => {
        const wrapper = mount(MatchManager);

        expect(wrapper.findComponent('[data-test="obs-scenes-changed-warning"]').exists()).toEqual(false);
    });

    it('shows warning if obs scene configuration is changed', async () => {
        const obsStore = useObsStore();
        obsStore.obsData.gameplayScene = 'Gameplay Scene';
        obsStore.obsData.intermissionScene = 'Intermission Scene';
        const wrapper = mount(MatchManager);

        messageListeners.obsSceneConfigurationChangedAfterUpdate();
        await wrapper.vm.$nextTick();

        const warning = wrapper.findComponent('[data-test="obs-scenes-changed-warning"]');
        expect(warning.exists()).toEqual(true);
        expect(warning.text()).toEqual('The OBS scene configuration has changed. Please confirm that the configured gameplay and intermission scenes (\'Gameplay Scene\' & \'Intermission Scene\') are still correct.');
    });

    it('allows to close obs scene configuration warning', async () => {
        const wrapper = mount(MatchManager);

        messageListeners.obsSceneConfigurationChangedAfterUpdate();
        await wrapper.vm.$nextTick();

        const warning = wrapper.findComponent<typeof IplMessage>('[data-test="obs-scenes-changed-warning"]');
        expect(warning.exists()).toEqual(true);

        warning.vm.$emit('close');
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent('[data-test="obs-scenes-changed-warning"]').exists()).toEqual(false);
    });
});
