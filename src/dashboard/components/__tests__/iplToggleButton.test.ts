import IplToggleButton from '../iplToggleButton.vue';
import { config, mount } from '@vue/test-utils';

describe('IplToggleButton', () => {
    config.global.stubs = {
        IplButton: true
    };

    it('gives label to button', () => {
        const wrapper = mount(IplToggleButton, {
            props: {
                label: 'Label!',
                modelValue: false
            }
        });

        expect(wrapper.getComponent('ipl-button-stub').attributes().label).toEqual('Label!');
    });

    it('gives expected color to button when value is false', () => {
        const wrapper = mount(IplToggleButton, {
            props: {
                label: 'Label!',
                modelValue: false
            }
        });

        expect(wrapper.getComponent('ipl-button-stub').attributes().color).toEqual('#2F3A4F');
    });

    it('gives expected color to button when value is true', () => {
        const wrapper = mount(IplToggleButton, {
            props: {
                label: 'Label!',
                modelValue: true
            }
        });

        expect(wrapper.getComponent('ipl-button-stub').attributes().color).toEqual('green');
    });

    it('toggles value on click', async () => {
        const wrapper = mount(IplToggleButton, {
            props: {
                label: 'Label!',
                modelValue: false
            }
        });

        await wrapper.getComponent('.ipl-toggle-button').trigger('click');

        const emitted = wrapper.emitted('update:modelValue');
        expect(emitted.length).toEqual(1);
        expect(emitted[0]).toEqual([true]);
    });
});
