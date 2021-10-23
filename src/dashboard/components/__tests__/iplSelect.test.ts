import IplSelect from '../iplSelect.vue';
import { mount } from '@vue/test-utils';

describe('IplSelect', () => {
    it('applies given label to element', () => {
        const wrapper = mount(IplSelect, { props: { label: 'Label!', modelValue: '', options: []} });

        expect(wrapper.get('label').text()).toEqual('Label!');
    });

    it('applies given options to select element', () => {
        const wrapper = mount(IplSelect, { props: { modelValue: '', options: [
            { name: 'Option', value: 'opt' },
            { name: 'Option the Second', value: 'opt2' },
            { name: 'Opt 3', value: 'optthree' }
        ]} });

        expect(wrapper.get('select').html()).toMatchSnapshot();
    });

    it('emits update message on change', async () => {
        const wrapper = mount(IplSelect, { props: { modelValue: '', options: [
            { name: 'Option', value: 'opt' },
            { name: 'Option the Second', value: 'opt2' },
            { name: 'Opt 3', value: 'optthree' }
        ]} });

        await wrapper.get('select').setValue('opt2');

        const emitted = wrapper.emitted('update:modelValue');
        expect(emitted.length).toEqual(1);
        expect(emitted[0]).toEqual(['opt2']);
    });
});
