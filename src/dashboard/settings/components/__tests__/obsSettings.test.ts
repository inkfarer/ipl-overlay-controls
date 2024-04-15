import { config, mount } from '@vue/test-utils';
import { useObsStore } from '../../../store/obsStore';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import ObsSettings from '../obsSettings.vue';

describe('obsSettings', () => {
    config.global.stubs = {
        ObsSocketSettings: true,
        ObsDataPicker: true
    };

    let pinia: TestingPinia;

    beforeEach(() => {
        pinia = createTestingPinia();

        config.global.plugins = [pinia];
    });

    it('shows the obs data picker when the obs socket is enabled', () => {
        const obsStore = useObsStore();
        // @ts-ignore
        obsStore.obsData = { enabled: true };
        const wrapper = mount(ObsSettings);

        expect(wrapper.find('obs-data-picker-stub').exists()).toEqual(true);
    });

    it('hides the obs data picker when the obs socket is disabled', () => {
        const obsStore = useObsStore();
        // @ts-ignore
        obsStore.obsData = { enabled: false };
        const wrapper = mount(ObsSettings);

        expect(wrapper.find('obs-data-picker-stub').exists()).toEqual(false);
    });
});
