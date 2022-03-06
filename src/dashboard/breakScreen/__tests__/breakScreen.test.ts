import BreakScreen from '../breakScreen.vue';
import { config, mount } from '@vue/test-utils';
import { useBreakScreenStore } from '../breakScreenStore';
import { createTestingPinia } from '@pinia/testing';

describe('BreakScreen', () => {
    config.global.stubs = {
        IplButton: true,
        IplInput: true,
        IplCheckbox: true,
        NextStageTimeInput: true,
        IplErrorDisplay: true
    };

    it('disabled expected button if active scene is main', () => {
        const pinia = createTestingPinia();
        const store = useBreakScreenStore();
        store.activeBreakScene = 'main';
        const wrapper = mount(BreakScreen, {
            global: {
                plugins: [ pinia ]
            }
        });

        expect(wrapper.getComponent('[data-test="show-main-button"]').attributes().disabled).toEqual('true');
        expect(wrapper.getComponent('[data-test="show-teams-button"]').attributes().disabled).toEqual('false');
        expect(wrapper.getComponent('[data-test="show-stages-button"]').attributes().disabled).toEqual('false');
    });

    it('disabled expected button if active scene is teams', () => {
        const pinia = createTestingPinia();
        const store = useBreakScreenStore();
        store.activeBreakScene = 'teams';
        const wrapper = mount(BreakScreen, {
            global: {
                plugins: [ pinia ]
            }
        });

        expect(wrapper.getComponent('[data-test="show-main-button"]').attributes().disabled).toEqual('false');
        expect(wrapper.getComponent('[data-test="show-teams-button"]').attributes().disabled).toEqual('true');
        expect(wrapper.getComponent('[data-test="show-stages-button"]').attributes().disabled).toEqual('false');
    });

    it('disabled expected button if active scene is stages', () => {
        const pinia = createTestingPinia();
        const store = useBreakScreenStore();
        store.activeBreakScene = 'stages';
        const wrapper = mount(BreakScreen, {
            global: {
                plugins: [ pinia ]
            }
        });

        expect(wrapper.getComponent('[data-test="show-main-button"]').attributes().disabled).toEqual('false');
        expect(wrapper.getComponent('[data-test="show-teams-button"]').attributes().disabled).toEqual('false');
        expect(wrapper.getComponent('[data-test="show-stages-button"]').attributes().disabled).toEqual('true');
    });

    it('updates main flavor text on store change', async () => {
        const pinia = createTestingPinia();
        const store = useBreakScreenStore();
        store.mainFlavorText = 'hello!!!';
        const wrapper = mount(BreakScreen, {
            global: {
                plugins: [ pinia ]
            }
        });

        store.mainFlavorText = 'new text!!!';
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[name="break-main-flavor-text"]').attributes().modelvalue).toEqual('new text!!!');
    });

    it('does not update main flavor text on store change if input is focused', async () => {
        const pinia = createTestingPinia();
        const store = useBreakScreenStore();
        store.mainFlavorText = 'hello!!!';
        const wrapper = mount(BreakScreen, {
            global: {
                plugins: [ pinia ]
            }
        });
        const flavorTextInput = wrapper.getComponent('[name="break-main-flavor-text"]');

        flavorTextInput.vm.$emit('focuschange', true);
        store.mainFlavorText = 'new text!!!';
        await wrapper.vm.$nextTick();

        expect(flavorTextInput.attributes().modelvalue).toEqual('hello!!!');
    });

    it('updates next round time on store change', async () => {
        const pinia = createTestingPinia();
        const store = useBreakScreenStore();
        store.nextRoundStartTime = { startTime: '2020-05-12', isVisible: true };
        const wrapper = mount(BreakScreen, {
            global: {
                plugins: [ pinia ]
            }
        });

        store.nextRoundStartTime.startTime = '2021-03-09';
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="next-stage-time-input"]').attributes().modelvalue).toEqual('2021-03-09');
    });

    it('does not update next round time on store change if input is focused', async () => {
        const pinia = createTestingPinia();
        const store = useBreakScreenStore();
        store.nextRoundStartTime = { startTime: '2020-05-12', isVisible: true };
        const wrapper = mount(BreakScreen, {
            global: {
                plugins: [ pinia ]
            }
        });
        const nextStageTimeInput = wrapper.getComponent('[data-test="next-stage-time-input"]');

        nextStageTimeInput.vm.$emit('focuschange', true);
        store.nextRoundStartTime.startTime = '2021-03-09';
        await wrapper.vm.$nextTick();

        expect(nextStageTimeInput.attributes().modelvalue).toEqual('2020-05-12');
    });

    it('updates data on main scene update button click', async () => {
        const pinia = createTestingPinia();
        const store = useBreakScreenStore(pinia);
        store.setNextRoundStartTime = jest.fn();
        store.setMainFlavorText = jest.fn();
        store.mainFlavorText = 'flavor text??';
        store.nextRoundStartTime.startTime = 'start time!!';
        const wrapper = mount(BreakScreen, {
            global: {
                plugins: [ pinia ]
            }
        });

        wrapper.getComponent('[name="break-main-flavor-text"]').vm.$emit('update:modelValue', 'new text!!!');
        wrapper.getComponent('[data-test="next-stage-time-input"]').vm.$emit('update:modelValue', '2020-01-02');
        await wrapper.vm.$nextTick();

        wrapper.getComponent('[data-test="update-main-scene-button"]').vm.$emit('click');

        expect(store.setMainFlavorText).toHaveBeenCalledWith('new text!!!');
        expect(store.setNextRoundStartTime).toHaveBeenCalledWith('2020-01-02');
    });

    it('reverts changes to main scene data on update button right click', async () => {
        const pinia = createTestingPinia();
        const store = useBreakScreenStore();
        store.mainFlavorText = 'flavor text??';
        store.nextRoundStartTime.startTime = 'start time!!';
        const wrapper = mount(BreakScreen, {
            global: {
                plugins: [ pinia ]
            }
        });

        wrapper.getComponent('[name="break-main-flavor-text"]').vm.$emit('update:modelValue', 'new text!!!');
        wrapper.getComponent('[data-test="next-stage-time-input"]').vm.$emit('update:modelValue', '2020-01-02');
        wrapper.getComponent('[data-test="update-main-scene-button"]').vm.$emit('right-click', new Event(null));
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="next-stage-time-input"]').attributes().modelvalue).toEqual('start time!!');
        expect(wrapper.getComponent('[name="break-main-flavor-text"]').attributes().modelvalue).toEqual('flavor text??');
    });
});
