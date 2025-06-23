import BreakScreen from '../breakScreen.vue';
import { config, mount } from '@vue/test-utils';
import { useBreakScreenStore } from '../breakScreenStore';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { IplButton, IplInput } from '@iplsplatoon/vue-components';
import NextStageTimeInput from '../components/nextStageTimeInput.vue';

describe('BreakScreen', () => {
    let pinia: TestingPinia;

    config.global.stubs = {
        IplButton: true,
        IplInput: true,
        IplCheckbox: true,
        NextStageTimeInput: true,
        IplErrorDisplay: true,
        FontAwesomeIcon: true
    };

    beforeEach(() => {
        pinia = createTestingPinia();
        config.global.plugins = [pinia];

        const store = useBreakScreenStore();
        store.bundleDeclaredConfig = {};
        // @ts-ignore
        store.runtimeConfig = {
            activeGraphicsBundles: []
        };
    });

    it('matches snapshot without custom scenes', () => {
        const store = useBreakScreenStore();
        store.activeBreakScene = 'main';
        const wrapper = mount(BreakScreen);
        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot with custom scenes', () => {
        const store = useBreakScreenStore();
        store.activeBreakScene = 'casters';
        store.runtimeConfig.activeGraphicsBundles = ['sj-overlays', 'sj-overlays-addon'];
        store.bundleDeclaredConfig = {
            'sj-overlays': {
                scenes: [
                    { value: 'casters', names: { EN: 'Casters!' } }
                ]
            },
            'sj-overlays-addon': {
                scenes: [
                    { value: 'stats', names: { EN: 'Statistics' } },
                    { value: 'analysts', names: { EN: 'Analyst desk' } }
                ]
            },
            'disabled-bundle': {
                scenes: [
                    { value: 'cool-scene', names: { EN: 'This scene shouldn\'t be visible' } }
                ]
            }
        };

        const wrapper = mount(BreakScreen);
        expect(wrapper.html()).toMatchSnapshot();
    });

    it('disabled expected button if active scene is main', () => {
        const store = useBreakScreenStore();
        store.activeBreakScene = 'main';
        const wrapper = mount(BreakScreen);

        expect(wrapper.getComponent('[data-test="show-main-button"]').attributes().disabled).toEqual('true');
        expect(wrapper.getComponent('[data-test="show-teams-button"]').attributes().disabled).toEqual('false');
        expect(wrapper.getComponent('[data-test="show-stages-button"]').attributes().disabled).toEqual('false');
    });

    it('disabled expected button if active scene is teams', () => {
        const store = useBreakScreenStore();
        store.activeBreakScene = 'teams';
        const wrapper = mount(BreakScreen);

        expect(wrapper.getComponent('[data-test="show-main-button"]').attributes().disabled).toEqual('false');
        expect(wrapper.getComponent('[data-test="show-teams-button"]').attributes().disabled).toEqual('true');
        expect(wrapper.getComponent('[data-test="show-stages-button"]').attributes().disabled).toEqual('false');
    });

    it('disabled expected button if active scene is stages', () => {
        const store = useBreakScreenStore();
        store.activeBreakScene = 'stages';
        const wrapper = mount(BreakScreen);

        expect(wrapper.getComponent('[data-test="show-main-button"]').attributes().disabled).toEqual('false');
        expect(wrapper.getComponent('[data-test="show-teams-button"]').attributes().disabled).toEqual('false');
        expect(wrapper.getComponent('[data-test="show-stages-button"]').attributes().disabled).toEqual('true');
    });

    it('updates main flavor text on store change', async () => {
        const store = useBreakScreenStore();
        store.mainFlavorText = 'hello!!!';
        const wrapper = mount(BreakScreen);

        store.mainFlavorText = 'new text!!!';
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[name="break-main-flavor-text"]').attributes().modelvalue).toEqual('new text!!!');
    });

    it('does not update main flavor text on store change if input is focused', async () => {
        const store = useBreakScreenStore();
        store.mainFlavorText = 'hello!!!';
        const wrapper = mount(BreakScreen);
        const flavorTextInput = wrapper.getComponent<typeof IplInput>('[name="break-main-flavor-text"]');

        flavorTextInput.vm.$emit('focuschange', true);
        store.mainFlavorText = 'new text!!!';
        await wrapper.vm.$nextTick();

        expect(flavorTextInput.attributes().modelvalue).toEqual('hello!!!');
    });

    it('updates next round time on store change', async () => {
        const store = useBreakScreenStore();
        store.nextRoundStartTime = { startTime: '2020-05-12', isVisible: true };
        const wrapper = mount(BreakScreen);

        store.nextRoundStartTime.startTime = '2021-03-09';
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="next-stage-time-input"]').attributes().modelvalue).toEqual('2021-03-09');
    });

    it('does not update next round time on store change if input is focused', async () => {
        const store = useBreakScreenStore();
        store.nextRoundStartTime = { startTime: '2020-05-12', isVisible: true };
        const wrapper = mount(BreakScreen);
        const nextStageTimeInput = wrapper.getComponent<typeof NextStageTimeInput>('[data-test="next-stage-time-input"]');

        nextStageTimeInput.vm.$emit('focuschange', true);
        store.nextRoundStartTime.startTime = '2021-03-09';
        await wrapper.vm.$nextTick();

        expect(nextStageTimeInput.attributes().modelvalue).toEqual('2020-05-12');
    });

    it('updates data on main scene update button click', async () => {
        const store = useBreakScreenStore(pinia);
        store.setNextRoundStartTime = jest.fn();
        store.setMainFlavorText = jest.fn();
        store.mainFlavorText = 'flavor text??';
        store.nextRoundStartTime.startTime = 'start time!!';
        const wrapper = mount(BreakScreen);

        wrapper.getComponent<typeof IplInput>('[name="break-main-flavor-text"]').vm.$emit('update:modelValue', 'new text!!!');
        wrapper.getComponent<typeof NextStageTimeInput>('[data-test="next-stage-time-input"]').vm.$emit('update:modelValue', '2020-01-02');
        await wrapper.vm.$nextTick();

        wrapper.getComponent<typeof IplButton>('[data-test="update-main-scene-button"]').vm.$emit('click');

        expect(store.setMainFlavorText).toHaveBeenCalledWith('new text!!!');
        expect(store.setNextRoundStartTime).toHaveBeenCalledWith('2020-01-02');
    });

    it('reverts changes to main scene data on update button right click', async () => {
        const store = useBreakScreenStore();
        store.mainFlavorText = 'flavor text??';
        store.nextRoundStartTime.startTime = 'start time!!';
        const wrapper = mount(BreakScreen);

        wrapper.getComponent<typeof IplInput>('[name="break-main-flavor-text"]').vm.$emit('update:modelValue', 'new text!!!');
        wrapper.getComponent<typeof NextStageTimeInput>('[data-test="next-stage-time-input"]').vm.$emit('update:modelValue', '2020-01-02');
        wrapper.getComponent<typeof IplButton>('[data-test="update-main-scene-button"]').vm.$emit('rightClick', new Event(null));
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="next-stage-time-input"]').attributes().modelvalue).toEqual('start time!!');
        expect(wrapper.getComponent('[name="break-main-flavor-text"]').attributes().modelvalue).toEqual('flavor text??');
    });
});
