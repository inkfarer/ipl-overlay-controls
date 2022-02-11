import { config, mount } from '@vue/test-utils';
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

    it('handles submitting', () => {
        const store = createSettingsStore();
        jest.spyOn(store, 'dispatch');
        const wrapper = mount(RuntimeConfig, {
            global: {
                plugins: [[store, settingsStoreKey]]
            }
        });

        wrapper.getComponent('[data-test="game-version-select"]').vm.$emit('update:modelValue', 'SPLATOON_3');
        wrapper.getComponent('[data-test="update-button"]').vm.$emit('click');

        expect(store.dispatch).toHaveBeenCalledWith('setGameVersion', 'SPLATOON_3');
    });
});
