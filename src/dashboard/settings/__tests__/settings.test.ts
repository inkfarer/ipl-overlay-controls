import { config, mount } from '@vue/test-utils';
import Settings from '../settings.vue';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { useObsStore } from '../../store/obsStore';
import { IplSpace } from '@iplsplatoon/vue-components';

describe('Settings', () => {
    let pinia: TestingPinia;

    config.global.stubs = {
        IplErrorDisplay: true,
        LastfmSettings: true,
        RadiaSettings: true,
        ObsSettings: true,
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

    it.each(['lastfm', 'radia', 'general', 'obs'])('matches snapshot when section %s is selected', async (section) => {
        const wrapper = mount(Settings, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplSpace>(`[data-test="section-selector_${section}"]`).vm.$emit('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.html()).toMatchSnapshot();
    });
});
