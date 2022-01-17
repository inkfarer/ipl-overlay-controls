import LastfmSettings from '../lastfmSettings.vue';
import { createStore } from 'vuex';
import { SettingsStore, settingsStoreKey } from '../../settingsStore';
import { mount, config } from '@vue/test-utils';

describe('lastfmSettings', () => {
    config.global.stubs = {
        IplInput: true,
        IplButton: true
    };

    const createSettingsStore = () => {
        return createStore<SettingsStore>({
            state: {
                lastFmSettings: {
                    username: 'username'
                },
                radiaSettings: {
                    guildID: null,
                    enabled: null,
                    updateOnImport: null
                }
            },
            mutations: {
                setLastFmSettings: jest.fn()
            }
        });
    };

    it('updates inputs on store change if unfocused', async () => {
        const store = createSettingsStore();
        const wrapper = mount(LastfmSettings, {
            global: {
                plugins: [[store, settingsStoreKey]]
            }
        });

        const usernameInput = wrapper.findComponent('[name="username"]');
        usernameInput.vm.$emit('focuschange', false);
        store.state.lastFmSettings.username = 'new username';
        await wrapper.vm.$nextTick();

        expect(usernameInput.attributes().modelvalue).toEqual('new username');
    });

    it('does not change input value on store change if it is focused', async () => {
        const store = createSettingsStore();
        const wrapper = mount(LastfmSettings, {
            global: {
                plugins: [[store, settingsStoreKey]]
            }
        });

        const usernameInput = wrapper.findComponent('[name="username"]');
        usernameInput.vm.$emit('focuschange', true);
        store.state.lastFmSettings.username = 'new username';
        await wrapper.vm.$nextTick();

        expect(usernameInput.attributes().modelvalue).toEqual('username');
    });

    it('updates settings on button click if they have been updated', async () => {
        const store = createSettingsStore();
        jest.spyOn(store, 'commit');
        const wrapper = mount(LastfmSettings, {
            global: {
                plugins: [[store, settingsStoreKey]]
            }
        });

        wrapper.getComponent('[name="username"]').vm.$emit('update:modelValue', 'new username');
        wrapper.getComponent('[data-test="update-button"]').vm.$emit('click');

        expect(store.commit).toHaveBeenCalledWith('setLastFmSettings', { newValue: { username: 'new username' } });
    });

    it('does not update settings on button click if data has not been updated', async () => {
        const store = createSettingsStore();
        jest.spyOn(store, 'commit');
        const wrapper = mount(LastfmSettings, {
            global: {
                plugins: [[store, settingsStoreKey]]
            }
        });

        wrapper.getComponent('[data-test="update-button"]').vm.$emit('click');

        expect(store.commit).not.toHaveBeenCalled();
    });

    it('has expected button color', async () => {
        const store = createSettingsStore();
        const wrapper = mount(LastfmSettings, {
            global: {
                plugins: [[store, settingsStoreKey]]
            }
        });

        expect(wrapper.getComponent('[data-test="update-button"]').props().color).toEqual('blue');
    });

    it('has expected button color when data is edited', async () => {
        const store = createSettingsStore();
        const wrapper = mount(LastfmSettings, {
            global: {
                plugins: [[store, settingsStoreKey]]
            }
        });

        wrapper.getComponent('[name="username"]').vm.$emit('update:modelValue', 'new username');
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="update-button"]').props().color).toEqual('red');
    });
});
