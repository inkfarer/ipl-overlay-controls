import IplMultiSelect from '../iplMultiSelect.vue';
import { mount } from '@vue/test-utils';

describe('IplMultiSelect', () => {
    it('applies given label to element', () => {
        const wrapper = mount(IplMultiSelect, { props: { label: 'Label!', modelValue: [], options: []} });

        expect(wrapper.get('label').text()).toEqual('Label!');
    });

    it('applies given options to select element', () => {
        const wrapper = mount(IplMultiSelect, {
            props: {
                label: '',
                modelValue: [],
                options: [
                    { name: 'Option', value: 'opt' },
                    { name: 'Option the Second', value: 'opt2' },
                    { name: 'Opt 3', value: 'optthree' }
                ]
            }
        });

        expect(wrapper.get('select').html()).toMatchSnapshot();
    });

    it('creates element for each selected option', () => {
        const wrapper = mount(IplMultiSelect, {
            props: {
                label: '',
                modelValue: [{ name: 'Option', value: 'opt' }, { name: 'Opt 3', value: 'optthree' }],
                options: [
                    { name: 'Option', value: 'opt' },
                    { name: 'Option the Second', value: 'opt2' },
                    { name: 'Opt 3', value: 'optthree' }
                ]
            }
        });

        expect(wrapper.get('.elem-display').html()).toMatchSnapshot();
    });

    it('emits update message on change', async () => {
        const wrapper = mount(IplMultiSelect, {
            props: {
                label: '',
                modelValue: [],
                options: [
                    { name: 'Option', value: 'opt' },
                    { name: 'Option the Second', value: 'opt2' },
                    { name: 'Opt 3', value: 'optthree' }
                ]
            }
        });

        await wrapper.get('select').setValue('opt2');

        const emitted = wrapper.emitted('update:modelValue');
        expect(emitted.length).toEqual(1);
        expect(emitted[0]).toEqual([[{ name: 'Option the Second', value: 'opt2' }]]);
    });

    it('handles selected option being removed', async () => {
        const wrapper = mount(IplMultiSelect, {
            props: {
                label: '',
                modelValue: [{ name: 'Option', value: 'opt' }, { name: 'Option the Second', value: 'opt2' }],
                options: [
                    { name: 'Option', value: 'opt' },
                    { name: 'Option the Second', value: 'opt2' },
                    { name: 'Opt 3', value: 'optthree' }
                ]
            }
        });

        await wrapper.get('.option').trigger('click');

        const emitted = wrapper.emitted('update:modelValue');
        expect(emitted.length).toEqual(1);
        expect(emitted[0]).toEqual([[{ name: 'Option the Second', value: 'opt2' }]]);
    });

    it('removes selected option when it is removed from options list', async () => {
        const wrapper = mount(IplMultiSelect, {
            props: {
                label: '',
                modelValue: [{ name: 'Option', value: 'opt' }, { name: 'Option the Second', value: 'opt2' }],
                options: [
                    { name: 'Option', value: 'opt' },
                    { name: 'Option the Second', value: 'opt2' },
                    { name: 'Opt 3', value: 'optthree' }
                ]
            }
        });

        await wrapper.setProps({
            options: [
                { name: 'Option', value: 'opt' },
                { name: 'Opt 3', value: 'optthree' }
            ]
        });

        const emitted = wrapper.emitted('update:modelValue');
        expect(emitted.length).toEqual(1);
        expect(emitted[0]).toEqual([[{ name: 'Option', value: 'opt' }]]);
    });
});
