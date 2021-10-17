import IplButton from '../iplButton.vue';
import { config, shallowMount } from '@vue/test-utils';
import { buttonColors } from '../../styles/colors';

describe('iplButton', () => {
    config.global.stubs = {
        FontAwesomeIcon: true
    };

    it('applies label to element', () => {
        const wrapper = shallowMount(IplButton, { props: { label: 'Button' } });

        expect(wrapper.find('span.label').text()).toEqual('Button');
    });

    it('creates icon if given', () => {
        const wrapper = shallowMount(IplButton, { props: { icon: 'cool-icon' } });

        expect(wrapper.find('font-awesome-icon-stub.icon').attributes().icon).toEqual('cool-icon');
    });

    it('does not create label element if icon is given', () => {
        const wrapper = shallowMount(IplButton, { props: { icon: 'cool-icon', label: 'something' } });

        expect(wrapper.find('span.label').exists()).toEqual(false);
        expect(wrapper.find('font-awesome-icon-stub.icon').exists()).toEqual(true);
    });

    it('throws error if icon and label are both missing', () => {
        expect(() => shallowMount(IplButton, { props: { icon: undefined, label: '' } }))
            .toThrow('ipl-button requires an icon or label to be provided.');
    });

    it('applies appropriate style according to color prop', () => {
        const redWrapper = shallowMount(IplButton, { props: { label: 'Button', color: 'red' } });
        const greenWrapper = shallowMount(IplButton, { props: { label: 'Button', color: 'green' } });

        expect(redWrapper.find('a').element.style.backgroundColor).toEqual('rgb(231, 78, 54)');
        expect(greenWrapper.find('a').element.style.backgroundColor).toEqual('rgb(0, 166, 81)');
    });

    it('emits event on click', async () => {
        const wrapper = shallowMount(IplButton, { props: { label: 'Button' } });

        await wrapper.find('a').trigger('click');

        expect(wrapper.emitted().click.length).toEqual(1);
    });

    it('does not emit event if disabled', async () => {
        const wrapper = shallowMount(IplButton, { props: { label: 'Button', disabled: true } });

        await wrapper.find('a').trigger('click');

        expect(wrapper.emitted().click).toBeUndefined();
    });

    it('gives class to link button element if disabled', () => {
        const wrapper = shallowMount(IplButton, { props: { label: 'Button', disabled: true } });

        expect(wrapper.find('a').classes()).toContain('disabled');
    });

    it('gives class to link button element if element has icon', () => {
        const wrapper = shallowMount(IplButton, { props: { icon: 'dope-icon' } });

        expect(wrapper.find('a').classes()).toContain('has-icon');
    });

    describe('validator: color', () => {
        const validator = IplButton.props.color.validator as (value: string) => boolean;

        Object.keys(buttonColors).forEach(color => {
            it(`allows color '${color}'`, () => {
                expect(validator(color)).toEqual(true);
            });
        });

        it('does not allow unknown colors', () => {
            expect(validator('something that is not a color')).toEqual(false);
        });
    });
});
