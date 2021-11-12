import IplInput from '../iplInput.vue';
import { mount } from '@vue/test-utils';

describe('IplInput', () => {
    it('provides props to inner elements', () => {
        const wrapper = mount(IplInput, { props: { label: 'Label', name: 'input', type: 'number', disabled: true } });

        const input = wrapper.get('input');
        expect(input.element.name).toEqual('input');
        expect(input.element.type).toEqual('number');
        expect(input.element.disabled).toEqual(true);
        expect(input.element.classList).not.toContain('centered');
        expect(wrapper.find('.ipl-label').text()).toEqual('Label');
    });

    it('shows extra text and has additional classes if given', () => {
        const wrapper = mount(IplInput, { props: { label: 'Label', name: 'input', extra: 'extra' } });

        expect(wrapper.get('.extra').text()).toEqual('extra');
        const wrapperClasses = wrapper.get('.ipl-input__text-input-wrapper').element.classList;
        expect(wrapperClasses).toContain('layout');
        expect(wrapperClasses).toContain('horizontal');
    });

    it('gives class to input if set as centered', () => {
        const wrapper = mount(IplInput, { props: {  label: 'Label', name: 'input', centered: true  } });

        const input = wrapper.get('input');
        expect(input.element.classList).toContain('centered');
    });

    it('has class if type is color', () => {
        const wrapper = mount(IplInput, { props: { name: 'input', type: 'color'  } });

        const textInputWrapper = wrapper.get('.ipl-input__text-input-wrapper');
        expect(textInputWrapper.element.classList).toContain('is-color');
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

    it('updates v-model with formatted input if formatter is passed to component', async () => {
        const wrapper = mount(IplInput, { props: { label: 'Label', name: 'input', formatter: (value: string) => `${value}_formatted` } });
        const innerInput = wrapper.get('input');

        await innerInput.setValue('new text');

        const emitted = wrapper.emitted();
        expect(emitted.input.length).toEqual(1);
        const modelValueUpdates = emitted['update:modelValue'];
        expect(modelValueUpdates.length).toEqual(1);
        expect(modelValueUpdates[0]).toEqual(['new text_formatted']);
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

    it('hides error message if validator has not run', () => {
        const wrapper = mount(IplInput, {
            props: {
                label: 'Label',
                name: 'input',
                validator: {
                    isValid: null
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
