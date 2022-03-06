import LastfmSettings from '../lastfmSettings.vue';
import { mount, config } from '@vue/test-utils';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { useSettingsStore } from '../../settingsStore';

describe('lastfmSettings', () => {
    let pinia: TestingPinia;

    config.global.stubs = {
        IplInput: true,
        IplButton: true
    };

    beforeEach(() => {
        pinia = createTestingPinia();

        useSettingsStore().$state = {
            lastFmSettings: {
                username: 'username'
            },
            radiaSettings: {
                guildID: null,
                enabled: null,
                updateOnImport: null
            },
            runtimeConfig: null
        };
    });

    it('updates inputs on store change if unfocused', async () => {
        const store = useSettingsStore();
        const wrapper = mount(LastfmSettings, {
            global: {
                plugins: [pinia]
            }
        });

        const usernameInput = wrapper.findComponent('[name="username"]');
        usernameInput.vm.$emit('focuschange', false);
        store.lastFmSettings.username = 'new username';
        await wrapper.vm.$nextTick();

        expect(usernameInput.attributes().modelvalue).toEqual('new username');
    });

    it('does not change input value on store change if it is focused', async () => {
        const store = useSettingsStore();
        const wrapper = mount(LastfmSettings, {
            global: {
                plugins: [pinia]
            }
        });

        const usernameInput = wrapper.findComponent('[name="username"]');
        usernameInput.vm.$emit('focuschange', true);
        store.lastFmSettings.username = 'new username';
        await wrapper.vm.$nextTick();

        expect(usernameInput.attributes().modelvalue).toEqual('username');
    });

    it('updates settings on button click if they have been updated', async () => {
        const store = useSettingsStore();
        store.setLastFmSettings = jest.fn();
        const wrapper = mount(LastfmSettings, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent('[name="username"]').vm.$emit('update:modelValue', 'new username');
        wrapper.getComponent('[data-test="update-button"]').vm.$emit('click');

        expect(store.setLastFmSettings).toHaveBeenCalledWith({ newValue: { username: 'new username' } });
    });

    it('reverts changes when update button is right clicked', async () => {
        const wrapper = mount(LastfmSettings, {
            global: {
                plugins: [pinia]
            }
        });
        const event = new Event(null);
        jest.spyOn(event, 'preventDefault');

        wrapper.getComponent('[name="username"]').vm.$emit('update:modelValue', 'new username');
        wrapper.getComponent('[data-test="update-button"]').vm.$emit('right-click', event);
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[name="username"]').attributes().modelvalue).toEqual('username');
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('does not update settings on button click if data has not been updated', async () => {
        const store = useSettingsStore();
        store.setLastFmSettings = jest.fn();
        const wrapper = mount(LastfmSettings, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent('[data-test="update-button"]').vm.$emit('click');

        expect(store.setLastFmSettings).not.toHaveBeenCalled();
    });

    it('has expected button color', async () => {
        const wrapper = mount(LastfmSettings, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.getComponent('[data-test="update-button"]').props().color).toEqual('blue');
    });

    it('has expected button color when data is edited', async () => {
        const wrapper = mount(LastfmSettings, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent('[name="username"]').vm.$emit('update:modelValue', 'new username');
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="update-button"]').props().color).toEqual('red');
    });
});
