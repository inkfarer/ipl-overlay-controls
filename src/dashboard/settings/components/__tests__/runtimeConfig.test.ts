import { config, flushPromises, mount } from '@vue/test-utils';
import { GameVersion } from 'types/enums/gameVersion';
import RuntimeConfig from '../runtimeConfig.vue';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { useSettingsStore } from '../../../store/settingsStore';
import { IplButton, IplMessage, IplSelect } from '@iplsplatoon/vue-components';

describe('RuntimeConfig', () => {
    let pinia: TestingPinia;

    config.global.stubs = {
        IplSelect: true,
        IplButton: true
    };

    beforeEach(() => {
        pinia = createTestingPinia();

        useSettingsStore().$state = {
            lastFmSettings: null,
            radiaSettings: null,
            // @ts-ignore
            runtimeConfig: {
                gameVersion: GameVersion.SPLATOON_2
            }
        };
    });

    it('matches snapshot', () => {
        const wrapper = mount(RuntimeConfig, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot when changing data', async () => {
        const wrapper = mount(RuntimeConfig, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplSelect>('[data-test="game-version-select"]').vm.$emit('update:modelValue', 'SPLATOON_3');
        await wrapper.vm.$nextTick();

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('handles submitting', async () => {
        const store = useSettingsStore();
        store.setGameVersion = jest.fn().mockResolvedValue({ incompatibleBundles: []});
        const wrapper = mount(RuntimeConfig, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplSelect>('[data-test="game-version-select"]').vm.$emit('update:modelValue', GameVersion.SPLATOON_3);
        wrapper.getComponent<typeof IplButton>('[data-test="update-button"]').vm.$emit('click');
        await flushPromises();

        expect(store.setGameVersion).toHaveBeenCalledWith(GameVersion.SPLATOON_3);
        expect(wrapper.findComponent('[data-test="incompatible-bundle-warning"]').exists()).toEqual(false);
    });

    it('reverts changes when submit button is right clicked', async () => {
        const wrapper = mount(RuntimeConfig, {
            global: {
                plugins: [pinia]
            }
        });
        const event = new Event(null);
        jest.spyOn(event, 'preventDefault');

        wrapper.getComponent<typeof IplSelect>('[data-test="game-version-select"]').vm.$emit('update:modelValue', 'SPLATOON_3');
        wrapper.getComponent<typeof IplButton>('[data-test="update-button"]').vm.$emit('rightClick', event);
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="game-version-select"]').attributes().modelvalue).toEqual('SPLATOON_2');
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('handles submitting when incompatible bundles are found', async () => {
        const store = useSettingsStore();
        store.runtimeConfig.gameVersion = GameVersion.SPLATOON_3;
        store.setGameVersion = jest.fn().mockResolvedValue({ incompatibleBundles: ['old-bundle', 'old-bundle-2']});
        const wrapper = mount(RuntimeConfig, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplSelect>('[data-test="game-version-select"]').vm.$emit('update:modelValue', 'SPLATOON_2');
        wrapper.getComponent<typeof IplButton>('[data-test="update-button"]').vm.$emit('click');
        await flushPromises();

        expect(store.setGameVersion).toHaveBeenCalledWith('SPLATOON_2');
        const warning = wrapper.findComponent('[data-test="incompatible-bundle-warning"]');
        expect(warning.exists()).toEqual(true);
        expect(warning.text()).toEqual('translation:general.incompatibleBundleWarning');
    });

    it('handles closing incompatible bundle warning', async () => {
        const store = useSettingsStore();
        store.runtimeConfig.gameVersion = GameVersion.SPLATOON_3;
        store.setGameVersion = jest.fn().mockResolvedValue({ incompatibleBundles: ['old-bundle', 'old-bundle-2']});
        const wrapper = mount(RuntimeConfig, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplSelect>('[data-test="game-version-select"]').vm.$emit('update:modelValue', 'SPLATOON_2');
        wrapper.getComponent<typeof IplButton>('[data-test="update-button"]').vm.$emit('click');
        await flushPromises();

        const warning = wrapper.findComponent<typeof IplMessage>('[data-test="incompatible-bundle-warning"]');
        expect(warning.exists()).toEqual(true);

        warning.vm.$emit('close');
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent('[data-test="incompatible-bundle-warning"]').exists()).toEqual(false);
    });
});
