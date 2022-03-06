import { config, mount } from '@vue/test-utils';
import Settings from '../settings.vue';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { useObsStore } from '../../store/obsStore';

describe('Settings', () => {
    let pinia: TestingPinia;

    config.global.stubs = {
        IplErrorDisplay: true,
        LastfmSettings: true,
        RadiaSettings: true,
        ObsSocketSettings: true,
        ObsDataPicker: true,
        RuntimeConfig: true,
        FontAwesomeIcon: true
    };

    beforeEach(() => {
        pinia = createTestingPinia();

        useObsStore().$state = {
            // @ts-ignore
            obsData: {
                enabled: true
            }
        };
    });

    it.each(['lastfm', 'radia', 'gameVersion', 'obs-socket'])('matches snapshot when section %s is selected', async (section) => {
        const wrapper = mount(Settings, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent('[data-test="open-sidebar-button"]').vm.$emit('click');
        await wrapper.vm.$nextTick();
        wrapper.getComponent(`[data-test="section-selector_${section}"]`).vm.$emit('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot when OBS socket is disabled', async () => {
        const obsStore = useObsStore();
        obsStore.obsData.enabled = false;
        const wrapper = mount(Settings, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent('[data-test="open-sidebar-button"]').vm.$emit('click');
        await wrapper.vm.$nextTick();
        wrapper.getComponent('[data-test="section-selector_obs-socket"]').vm.$emit('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.html()).toMatchSnapshot();
    });
});
