import IplButton from '../iplButton.vue';
import { shallowMount } from '@vue/test-utils';
import { buttonColors } from '../../styles/colors';

describe('iplButton', () => {
    it('applies label to element', () => {
        const wrapper = shallowMount(IplButton, { props: { label: 'Button' } });

        expect(wrapper.find('span.label').text()).toEqual('Button');
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

    it('has class if disabled', () => {
        const wrapper = shallowMount(IplButton, { props: { label: 'Button', disabled: true } });

        expect(wrapper.find('a').classes()).toContain('disabled');
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
