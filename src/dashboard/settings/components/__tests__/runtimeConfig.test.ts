import { config, flushPromises, mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import { SettingsStore, settingsStoreKey } from '../../settingsStore';
import { GameVersion } from 'types/enums/gameVersion';
import RuntimeConfig from '../runtimeConfig.vue';

describe('RuntimeConfig', () => {
    config.global.stubs = {
        IplSelect: true,
        IplButton: true
    };

    const createSettingsStore = () => {
        return createStore<SettingsStore>({
            state: {
                lastFmSettings: null,
                radiaSettings: null,
                runtimeConfig: {
                    gameVersion: GameVersion.SPLATOON_2
                }
            },
            actions: {
                setGameVersion: jest.fn()
            }
        });
    };

    it('matches snapshot', () => {
        const store = createSettingsStore();
        const wrapper = mount(RuntimeConfig, {
            global: {
                plugins: [[store, settingsStoreKey]]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot when changing data', () => {
        const store = createSettingsStore();
        const wrapper = mount(RuntimeConfig, {
            global: {
                plugins: [[store, settingsStoreKey]]
            }
        });

        wrapper.getComponent('[data-test="game-version-select"]').vm.$emit('update:modelValue', 'SPLATOON_3');

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('handles submitting', async () => {
        const store = createSettingsStore();
        jest.spyOn(store, 'dispatch').mockResolvedValue({ incompatibleBundles: []});
        const wrapper = mount(RuntimeConfig, {
            global: {
                plugins: [[store, settingsStoreKey]]
            }
        });

        wrapper.getComponent('[data-test="game-version-select"]').vm.$emit('update:modelValue', 'SPLATOON_3');
        wrapper.getComponent('[data-test="update-button"]').vm.$emit('click');
        await flushPromises();

        expect(store.dispatch).toHaveBeenCalledWith('setGameVersion', 'SPLATOON_3');
        expect(wrapper.findComponent('[data-test="incompatible-bundle-warning"]').exists()).toEqual(false);
    });

    it('reverts changes when submit button is right clicked', async () => {
        const store = createSettingsStore();
        const wrapper = mount(RuntimeConfig, {
            global: {
                plugins: [[store, settingsStoreKey]]
            }
        });
        const event = new Event(null);
        jest.spyOn(event, 'preventDefault');

        wrapper.getComponent('[data-test="game-version-select"]').vm.$emit('update:modelValue', 'SPLATOON_3');
        wrapper.getComponent('[data-test="update-button"]').vm.$emit('right-click', event);
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="game-version-select"]').attributes().modelvalue).toEqual('SPLATOON_2');
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('handles submitting when an incompatible bundle is found', async () => {
        const store = createSettingsStore();
        store.state.runtimeConfig.gameVersion = GameVersion.SPLATOON_3;
        jest.spyOn(store, 'dispatch').mockResolvedValue({ incompatibleBundles: ['old-bundle']});
        const wrapper = mount(RuntimeConfig, {
            global: {
                plugins: [[store, settingsStoreKey]]
            }
        });

        wrapper.getComponent('[data-test="game-version-select"]').vm.$emit('update:modelValue', 'SPLATOON_3');
        wrapper.getComponent('[data-test="update-button"]').vm.$emit('click');
        await flushPromises();

        expect(store.dispatch).toHaveBeenCalledWith('setGameVersion', 'SPLATOON_3');
        const warning = wrapper.findComponent('[data-test="incompatible-bundle-warning"]');
        expect(warning.exists()).toEqual(true);
        expect(warning.text()).toEqual('Bundle old-bundle is incompatible with Splatoon 3.');
    });

    it('handles submitting when multiple incompatible bundles are found', async () => {
        const store = createSettingsStore();
        store.state.runtimeConfig.gameVersion = GameVersion.SPLATOON_3;
        jest.spyOn(store, 'dispatch').mockResolvedValue({ incompatibleBundles: ['old-bundle', 'old-bundle-2']});
        const wrapper = mount(RuntimeConfig, {
            global: {
                plugins: [[store, settingsStoreKey]]
            }
        });

        wrapper.getComponent('[data-test="game-version-select"]').vm.$emit('update:modelValue', 'SPLATOON_3');
        wrapper.getComponent('[data-test="update-button"]').vm.$emit('click');
        await flushPromises();

        expect(store.dispatch).toHaveBeenCalledWith('setGameVersion', 'SPLATOON_3');
        const warning = wrapper.findComponent('[data-test="incompatible-bundle-warning"]');
        expect(warning.exists()).toEqual(true);
        expect(warning.text()).toEqual('Bundles old-bundle and old-bundle-2 are incompatible with Splatoon 3.');
    });

    it('handles closing incompatible bundle warning', async () => {
        const store = createSettingsStore();
        store.state.runtimeConfig.gameVersion = GameVersion.SPLATOON_3;
        jest.spyOn(store, 'dispatch').mockResolvedValue({ incompatibleBundles: ['old-bundle', 'old-bundle-2']});
        const wrapper = mount(RuntimeConfig, {
            global: {
                plugins: [[store, settingsStoreKey]]
            }
        });

        wrapper.getComponent('[data-test="game-version-select"]').vm.$emit('update:modelValue', 'SPLATOON_3');
        wrapper.getComponent('[data-test="update-button"]').vm.$emit('click');
        await flushPromises();

        const warning = wrapper.findComponent('[data-test="incompatible-bundle-warning"]');
        expect(warning.exists()).toEqual(true);

        warning.vm.$emit('close');
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent('[data-test="incompatible-bundle-warning"]').exists()).toEqual(false);
    });
});
