import RadiaSettings from '../radiaSettings.vue';
import { createStore } from 'vuex';
import { SettingsStore, settingsStoreKey } from '../../settingsStore';
import { mount, config } from '@vue/test-utils';

describe('radiaSettings', () => {
    config.global.stubs = {
        IplInput: true,
        IplButton: true,
        IplCheckbox: true
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
                setRadiaSettings: jest.fn(),
                setUpdateOnImport: jest.fn()
            },
            actions: {
                attemptRadiaConnection: jest.fn()
            }
        });
    };

    it('shows message if radia is disabled', async () => {
        const store = createSettingsStore();
        store.state.radiaSettings.enabled = false;
        const wrapper = mount(RadiaSettings, {
            global: {
                plugins: [ [ store, settingsStoreKey ] ]
            }
        });

        const message = wrapper.findComponent('[data-test="radia-disabled-warning"]');
        expect(message.exists()).toEqual(true);
        expect(message.isVisible()).toEqual(true);
        const radiaConnectionButton = wrapper.findComponent('[data-test="radia-connect-button"]');
        expect(radiaConnectionButton.exists()).toEqual(true);
        expect(radiaConnectionButton.isVisible()).toEqual(true);
    });

    it('dispatches to store when reconnecting to radia', async () => {
        const store = createSettingsStore();
        jest.spyOn(store, 'dispatch');
        store.state.radiaSettings.enabled = false;
        const wrapper = mount(RadiaSettings, {
            global: {
                plugins: [ [ store, settingsStoreKey ] ]
            }
        });

        wrapper.getComponent('[data-test="radia-connect-button"]').vm.$emit('click');

        expect(store.dispatch).toHaveBeenCalledWith('attemptRadiaConnection');
    });

    it('hides message if radia is enabled', async () => {
        const store = createSettingsStore();
        store.state.radiaSettings.enabled = true;
        const wrapper = mount(RadiaSettings, {
            global: {
                plugins: [ [ store, settingsStoreKey ] ]
            }
        });

        const message = wrapper.findComponent('[data-test="radia-disabled-warning"]');
        expect(message.exists()).toEqual(false);
        const radiaConnectionButton = wrapper.findComponent('[data-test="radia-connect-button"]');
        expect(radiaConnectionButton.exists()).toEqual(false);
    });

    it('updates inputs on store change if unfocused', async () => {
        const store = createSettingsStore();
        const wrapper = mount(RadiaSettings, {
            global: {
                plugins: [ [ store, settingsStoreKey ] ]
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
                plugins: [ [ store, settingsStoreKey ] ]
            }
        });

        const usernameInput = wrapper.findComponent('[name="guild-id"]');
        usernameInput.vm.$emit('focuschange', true);
        store.state.radiaSettings.guildID = '345345';
        store.state.radiaSettings.updateOnImport = false;
        await wrapper.vm.$nextTick();

        expect(usernameInput.attributes().modelvalue).toEqual('123123');
        expect(wrapper.getComponent('[data-test="update-on-import-checkbox"]').attributes().modelvalue)
            .toEqual('false');
    });

    it('updates updateOnInput value on store change', async () => {
        const store = createSettingsStore();
        const wrapper = mount(RadiaSettings, {
            global: {
                plugins: [ [ store, settingsStoreKey ] ]
            }
        });

        store.state.radiaSettings.updateOnImport = true;
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="update-on-import-checkbox"]').attributes().modelvalue)
            .toEqual('true');
    });

    it('updates settings on button click if they have been updated', async () => {
        const store = createSettingsStore();
        jest.spyOn(store, 'commit');
        const wrapper = mount(RadiaSettings, {
            global: {
                plugins: [ [ store, settingsStoreKey ] ]
            }
        });

        wrapper.getComponent('[name="guild-id"]').vm.$emit('update:modelValue', '789789');
        wrapper.getComponent('[data-test="update-button"]').vm.$emit('click');

        expect(store.commit).toHaveBeenCalledWith('setRadiaSettings', {
            newValue: {
                enabled: null,
                guildID: '789789',
                updateOnImport: null
            }
        });
    });

    it('does not update settings on button click if data has not been updated', async () => {
        const store = createSettingsStore();
        jest.spyOn(store, 'commit');
        const wrapper = mount(RadiaSettings, {
            global: {
                plugins: [ [ store, settingsStoreKey ] ]
            }
        });

        wrapper.getComponent('[data-test="update-button"]').vm.$emit('click');

        expect(store.commit).not.toHaveBeenCalled();
    });

    it('has expected button color', async () => {
        const store = createSettingsStore();
        const wrapper = mount(RadiaSettings, {
            global: {
                plugins: [ [ store, settingsStoreKey ] ]
            }
        });

        expect(wrapper.getComponent('[data-test="update-button"]').props().color).toEqual('blue');
    });

    it('has expected button color when data is edited', async () => {
        const store = createSettingsStore();
        const wrapper = mount(RadiaSettings, {
            global: {
                plugins: [ [ store, settingsStoreKey ] ]
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
                plugins: [ [ store, settingsStoreKey ] ]
            }
        });

        wrapper.getComponent('[name="guild-id"]').vm.$emit('update:modelValue', 'something invalid');
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="update-button"]').props().disabled).toEqual(true);
    });

    it('updates updateOnImport value when relevant checkbox is interacted with', async () => {
        const store = createSettingsStore();
        jest.spyOn(store, 'commit');
        const wrapper = mount(RadiaSettings, {
            global: {
                plugins: [ [ store, settingsStoreKey ] ]
            }
        });

        wrapper.getComponent('[data-test="update-on-import-checkbox"]').vm.$emit('update:modelValue', true);
        await wrapper.vm.$nextTick();

        expect(store.commit).toHaveBeenCalledWith('setUpdateOnImport', true);
    });
});
