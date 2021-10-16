import IplToggle from '../iplToggle.vue';
import { shallowMount } from '@vue/test-utils';

describe('IplToggle', () => {
    it('toggles value on click', async () => {
        const wrapper = shallowMount(IplToggle, { props: { modelValue: false } });

        await wrapper.find('.ipl-toggle__container').trigger('click');

        const emitted = wrapper.emitted()['update:modelValue'];
        expect(emitted.length).toEqual(1);
        expect(emitted[0]).toEqual([true]);
    });

    it('gives class to true option text when value is true', () => {
        const wrapper = shallowMount(IplToggle, { props: { modelValue: true } });

        expect(wrapper.find('.true-option').classes()).toContain('selected');
        expect(wrapper.find('.false-option').classes()).not.toContain('selected');
    });

    it('gives class to false option text when value is false', () => {
        const wrapper = shallowMount(IplToggle, { props: { modelValue: false } });

        expect(wrapper.find('.true-option').classes()).not.toContain('selected');
        expect(wrapper.find('.false-option').classes()).toContain('selected');
    });

    it('gives class to button element if value is true', () => {
        const wrapper = shallowMount(IplToggle, { props: { modelValue: true } });

        expect(wrapper.find('.ipl-toggle__button').classes()).toContain('is-true');
    });

    it('does not give class to button element if value is false', () => {
        const wrapper = shallowMount(IplToggle, { props: { modelValue: false } });

        expect(wrapper.find('.ipl-toggle__button').classes()).not.toContain('is-true');
    });
});
