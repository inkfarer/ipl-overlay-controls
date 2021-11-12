import IplPanelTitle from '../iplDialogTitle.vue';
import { config, mount } from '@vue/test-utils';
import { mockDialog, mockGetDialog } from '../../__mocks__/mockNodecg';

describe('IplDialogTitle', () => {
    config.global.mocks = {
        FontAwesomeIcon: true
    };

    it('matches snapshot', () => {
        const wrapper = mount(IplPanelTitle, { props: { title: 'Cool Dialog', dialogName: 'coolDialog' } });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('closes dialog on close button click', () => {
        const wrapper = mount(IplPanelTitle, { props: { title: 'Cool Dialog', dialogName: 'coolDialog' } });

        wrapper.getComponent('[data-test="close-button"]').vm.$emit('click');

        expect(mockGetDialog).toHaveBeenCalledWith('coolDialog');
        expect(mockDialog.close).toHaveBeenCalledTimes(1);
    });
});
