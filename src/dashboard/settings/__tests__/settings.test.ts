import { config, mount } from '@vue/test-utils';
import Settings from '../settings.vue';

describe('Settings', () => {
    config.global.stubs = {
        IplErrorDisplay: true,
        LastfmSettings: true,
        RadiaSettings: true,
        ObsSocketSettings: true,
        ObsDataPicker: true,
        RuntimeConfig: true,
        FontAwesomeIcon: true
    };

    it('matches snapshot', () => {
        const wrapper = mount(Settings);

        expect(wrapper.html()).toMatchSnapshot();
    });

    it.each(['lastfm', 'radia', 'gameVersion', 'obs-socket'])('matches snapshot when section %s is selected', async (section) => {
        const wrapper = mount(Settings);

        wrapper.getComponent('[data-test="open-sidebar-button"]').vm.$emit('click');
        await wrapper.vm.$nextTick();
        wrapper.getComponent(`[data-test="section-selector_${section}"]`).vm.$emit('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.html()).toMatchSnapshot();
    });
});
