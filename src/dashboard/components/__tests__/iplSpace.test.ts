import IplSpace from '../iplSpace.vue';
import { shallowMount } from '@vue/test-utils';

describe('IplSpace', () => {
    it('has expected class when color is light', () => {
        const wrapper = shallowMount(IplSpace, { props: { color: 'light' } });

        expect(wrapper.get('.ipl-space').classes()).toContain('color-light');
    });

    it('has expected class when color is dark', () => {
        const wrapper = shallowMount(IplSpace, { props: { color: 'dark' } });

        expect(wrapper.get('.ipl-space').classes()).toContain('color-dark');
    });

    describe('validator: color', () => {
        const validator = IplSpace.props.color.validator as (value: string) => boolean;

        it('allows expected color values', () => {
            expect(validator('dark')).toEqual(true);
            expect(validator('light')).toEqual(true);
        });

        it('does not allow unexpected color values', () => {
            expect(validator('something')).toEqual(false);
            expect(validator('foobar')).toEqual(false);
            expect(validator(undefined)).toEqual(false);
            expect(validator(null)).toEqual(false);
        });
    });
});
