import IplInput from '../iplInput.vue';
import { mount } from '@vue/test-utils';

describe('IplInput', () => {
    it('provides props to inner elements', () => {
        const wrapper = mount(IplInput, { props: {  label: 'Label', name: 'input', type: 'number'  } });

        const input = wrapper.get('input');
        expect(input.element.name).toEqual('input');
        expect(input.element.type).toEqual('number');
        expect(wrapper.find('.ipl-label').text()).toEqual('Label');
    });

    it('sends event on focus change', () => {
        const wrapper = mount(IplInput, { props: { label: 'Label', name: 'input' } });
        const innerInput = wrapper.get('input');

        innerInput.trigger('focus');
        innerInput.trigger('blur');
        innerInput.trigger('input');

        const events = wrapper.emitted().focuschange;
        expect(events.length).toEqual(3);
        expect(events[0]).toEqual([true]);
        expect(events[1]).toEqual([false]);
        expect(events[2]).toEqual([true]);
    });

    it('sends event and updates v-model on input', async () => {
        const wrapper = mount(IplInput, { props: { label: 'Label', name: 'input' } });
        const innerInput = wrapper.get('input');

        await innerInput.setValue('new text');

        const emitted = wrapper.emitted();
        expect(emitted.input.length).toEqual(1);
        const modelValueUpdates = emitted['update:modelValue'];
        expect(modelValueUpdates.length).toEqual(1);
        expect(modelValueUpdates[0]).toEqual(['new text']);
    });

    it('shows no message if validator does not exist', () => {
        const wrapper = mount(IplInput, {
            props: {
                label: 'Label',
                name: 'input',
                validator: undefined
            }
        });

        expect(wrapper.find('.error').exists()).toBe(false);
    });

    it('applies classes to elements and shows error message if validator with error is provided', () => {
        const wrapper = mount(IplInput, {
            props: {
                label: 'Label',
                name: 'input',
                validator: {
                    isValid: false,
                    message: 'very bad!!!'
                }
            }
        });

        expect(wrapper.find('.error').text()).toEqual('very bad!!!');
        expect(wrapper.find('.ipl-input__text-input-wrapper').classes()).toContain('has-error');
        expect(wrapper.find('.ipl-label').classes()).toContain('has-error');
    });

    it('hides error message if no validator error is present', () => {
        const wrapper = mount(IplInput, {
            props: {
                label: 'Label',
                name: 'input',
                validator: {
                    isValid: true,
                    message: 'ok'
                }
            }
        });

        expect(wrapper.find('.error').isVisible()).toEqual(false);
        expect(wrapper.find('.ipl-input__text-input-wrapper').classes()).not.toContain('has-error');
        expect(wrapper.find('.ipl-label').classes()).not.toContain('has-error');
    });

    describe('validator: type', () => {
        const validator = IplInput.props.type.validator as (value: string) => boolean;

        it('allows valid input types', () => {
            expect(validator('text')).toEqual(true);
            expect(validator('number')).toEqual(true);
        });

        it('rejects invalid types', () => {
            expect(validator('something')).toEqual(false);
            expect(validator(undefined)).toEqual(false);
        });
    });
});
