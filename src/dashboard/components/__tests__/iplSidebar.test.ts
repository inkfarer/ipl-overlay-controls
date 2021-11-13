import IplSidebar from '../iplSidebar.vue';
import { mount } from '@vue/test-utils';

describe('IplSidebar', () => {
    it('matches snapshot when hidden', () => {
        expect(mount(IplSidebar, { props: { isOpen: false } }).html()).toMatchSnapshot();
    });

    it('matches snapshot when visible', () => {
        expect(mount(IplSidebar, { props: { isOpen: true } }).html()).toMatchSnapshot();
    });

    it('closes sidebar on background click', async () => {
        const wrapper = mount(IplSidebar, { props: { isOpen: true } });

        await wrapper.get('.background').trigger('click');

        const isOpenUpdates = wrapper.emitted('update:isOpen');
        expect(isOpenUpdates.length).toEqual(1);
        expect(isOpenUpdates[0]).toEqual([false]);
    });
});
