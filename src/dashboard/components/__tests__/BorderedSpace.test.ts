import { shallowMount } from '@vue/test-utils';
import BorderedSpace from '../BorderedSpace.vue';

describe('BorderedSpace', () => {
    it('matches snapshot', () => {
        const wrapper = shallowMount(BorderedSpace, {
            props: {
                label: 'Test Bordered Space'
            },
            slots: {
                default: '<div>test content</div>'
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });
});
