import { config, mount } from '@vue/test-utils';
import Settings from '../settings.vue';
import { createStore } from 'vuex';
import { obsStoreKey } from '../../store/obsStore';

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

    function createObsStore() {
        return createStore({
            state: {
                obsData: {
                    enabled: true
                }
            }
        });
    }

    it.each(['lastfm', 'radia', 'gameVersion', 'obs-socket'])('matches snapshot when section %s is selected', async (section) => {
        const obsStore = createObsStore();
        const wrapper = mount(Settings, {
            global: {
                plugins: [[obsStore, obsStoreKey]]
            }
        });

        wrapper.getComponent('[data-test="open-sidebar-button"]').vm.$emit('click');
        await wrapper.vm.$nextTick();
        wrapper.getComponent(`[data-test="section-selector_${section}"]`).vm.$emit('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot when OBS socket is disabled', async () => {
        const obsStore = createObsStore();
        obsStore.state.obsData.enabled = false;
        const wrapper = mount(Settings, {
            global: {
                plugins: [[obsStore, obsStoreKey]]
            }
        });

        wrapper.getComponent('[data-test="open-sidebar-button"]').vm.$emit('click');
        await wrapper.vm.$nextTick();
        wrapper.getComponent('[data-test="section-selector_obs-socket"]').vm.$emit('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.html()).toMatchSnapshot();
    });
});
