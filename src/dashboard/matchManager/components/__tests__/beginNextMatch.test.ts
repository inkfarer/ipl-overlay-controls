import BeginNextMatch from '../beginNextMatch.vue';
import { config, mount } from '@vue/test-utils';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { IplButton, IplInput } from '@iplsplatoon/vue-components';
import { useNextRoundStore } from '../../../store/nextRoundStore';

describe('BeginNextMatch', () => {
    let pinia: TestingPinia;

    beforeEach(() => {
        pinia = createTestingPinia();
        config.global.plugins = [pinia];

        // @ts-ignore
        useNextRoundStore().nextRound = { name: 'Cool Round' };
    });

    config.global.stubs = {
        IplInput: true,
        IplButton: true
    };

    it('matches snapshot', () => {
        const wrapper = mount(BeginNextMatch);

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('handles beginning next match', async () => {
        const nextRoundStore = useNextRoundStore();
        nextRoundStore.beginNextMatch = jest.fn();
        const wrapper = mount(BeginNextMatch);

        wrapper.getComponent<typeof IplInput>('[name="matchName"]').vm.$emit('update:modelValue', 'New Match');
        await wrapper.vm.$nextTick();
        wrapper.getComponent<typeof IplButton>('[data-test="begin-next-match-button"]').vm.$emit('click');

        expect(nextRoundStore.beginNextMatch).toHaveBeenCalledWith({ matchName: 'New Match' });
    });

    it('disables beginning match if match name is invalid', async () => {
        const wrapper = mount(BeginNextMatch);

        wrapper.getComponent<typeof IplInput>('[name="matchName"]').vm.$emit('update:modelValue', '');
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="begin-next-match-button"]').attributes().disabled).toEqual('true');
    });
});
