import IplCheckbox from '../iplCheckbox.vue';
import { shallowMount } from '@vue/test-utils';
import { dispatch } from '../../helpers/elemHelper';

describe('iplCheckbox', () => {
    it('emits event when checked', () => {
        const wrapper = shallowMount(IplCheckbox, { props: { label: 'checkbox' } });

        const input = wrapper.find('input');
        input.element.checked = true;
        dispatch(input.element, 'change');

        expect(wrapper.emitted()['update:modelValue'].length).toEqual(1);
    });

    it('has class when checked', async () => {
        const wrapper = shallowMount(IplCheckbox, { props: { label: 'checkbox', modelValue: true } });

        expect(wrapper.find('label').classes()).toContain('checked');
    });

    it('has class when set to small', async () => {
        const wrapper = shallowMount(IplCheckbox, { props: { label: 'checkbox', small: true } });

        expect(wrapper.find('label').classes()).toContain('small');
    });
});
