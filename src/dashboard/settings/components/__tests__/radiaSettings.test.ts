import RadiaSettings from '../radiaSettings.vue';
import { createStore } from 'vuex';
import { SettingsStore, settingsStoreKey } from '../../settingsStore';
import { mount, config } from '@vue/test-utils';

describe('radiaSettings', () => {
    config.global.stubs = {
        IplInput: true,
        IplButton: true
    };

    const createSettingsStore = () => {
        return createStore<SettingsStore>({
            state: {
                lastFmSettings: {},
                radiaSettings: {
                    guildID: '123123',
                    enabled: null,
                    updateOnImport: null
                }
            },
            mutations: {
                setRadiaSettings: jest.fn()
            }
        });
    };

    it('updates inputs on store change if unfocused', async () => {
        const store = createSettingsStore();
        const wrapper = mount(RadiaSettings, {
            global: {
                plugins: [[store, settingsStoreKey]]
            }
        });

        const guildIdInput = wrapper.findComponent('[name="guild-id"]');
        guildIdInput.vm.$emit('focuschange', false);
        store.state.radiaSettings.guildID = '345345';
        await wrapper.vm.$nextTick();

        expect(guildIdInput.attributes().modelvalue).toEqual('345345');
    });

    it('does not change input value on store change if it is focused', async () => {
        const store = createSettingsStore();
        const wrapper = mount(RadiaSettings, {
            global: {
                plugins: [[store, settingsStoreKey]]
            }
        });

        const usernameInput = wrapper.findComponent('[name="guild-id"]');
        usernameInput.vm.$emit('focuschange', true);
        store.state.lastFmSettings.username = '345345';
        await wrapper.vm.$nextTick();

        expect(usernameInput.attributes().modelvalue).toEqual('123123');
    });

    it('updates settings on button click if they have been updated', async () => {
        const store = createSettingsStore();
        jest.spyOn(store, 'commit');
        const wrapper = mount(RadiaSettings, {
            global: {
                plugins: [[store, settingsStoreKey]]
            }
        });

        wrapper.getComponent('[name="guild-id"]').vm.$emit('update:modelValue', '789789');
        wrapper.getComponent('[data-test="update-button"]').vm.$emit('click');

        expect(store.commit).toHaveBeenCalledWith('setRadiaSettings', { newValue: {
            enabled: null,
            guildID: '789789',
            updateOnImport: null
        } });
    });

    it('does not update settings on button click if data has not been updated', async () => {
        const store = createSettingsStore();
        jest.spyOn(store, 'commit');
        const wrapper = mount(RadiaSettings, {
            global: {
                plugins: [[store, settingsStoreKey]]
            }
        });

        wrapper.getComponent('[data-test="update-button"]').vm.$emit('click');

        expect(store.commit).not.toHaveBeenCalled();
    });

    it('has expected button color', async () => {
        const store = createSettingsStore();
        const wrapper = mount(RadiaSettings, {
            global: {
                plugins: [[store, settingsStoreKey]]
            }
        });

        expect(wrapper.getComponent('[data-test="update-button"]').props().color).toEqual('blue');
    });

    it('has expected button color when data is edited', async () => {
        const store = createSettingsStore();
        const wrapper = mount(RadiaSettings, {
            global: {
                plugins: [[store, settingsStoreKey]]
            }
        });

        wrapper.getComponent('[name="guild-id"]').vm.$emit('update:modelValue', '890890');
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="update-button"]').props().color).toEqual('red');
    });

    it('disables update button if data is invalid', async () => {
        const store = createSettingsStore();
        const wrapper = mount(RadiaSettings, {
            global: {
                plugins: [[store, settingsStoreKey]]
            }
        });

        wrapper.getComponent('[name="guild-id"]').vm.$emit('update:modelValue', 'something invalid');
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="update-button"]').props().disabled).toEqual(true);
    });
});
