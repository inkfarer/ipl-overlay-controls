import RadiaSettings from '../radiaSettings.vue';
import { mount, config } from '@vue/test-utils';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { useSettingsStore } from '../../../store/settingsStore';
import { IplButton, IplCheckbox, IplInput } from '@iplsplatoon/vue-components';

describe('radiaSettings', () => {
    let pinia: TestingPinia;

    config.global.stubs = {
        IplInput: true,
        IplButton: true,
        IplCheckbox: true
    };

    beforeEach(() => {
        pinia = createTestingPinia();

        useSettingsStore().$state = {
            lastFmSettings: {},
            radiaSettings: {
                guildID: '123123',
                enabled: null,
                updateOnImport: null
            },
            runtimeConfig: null,
            bundles: []
        };
    });

    it('shows message if radia is disabled', async () => {
        const store = useSettingsStore();
        store.radiaSettings.enabled = false;
        const wrapper = mount(RadiaSettings, {
            global: {
                plugins: [ pinia ]
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
        const store = useSettingsStore();
        store.attemptRadiaConnection = jest.fn();
        store.radiaSettings.enabled = false;
        const wrapper = mount(RadiaSettings, {
            global: {
                plugins: [ pinia ]
            }
        });

        wrapper.getComponent<typeof IplButton>('[data-test="radia-connect-button"]').vm.$emit('click');

        expect(store.attemptRadiaConnection).toHaveBeenCalled();
    });

    it('hides message if radia is enabled', async () => {
        const store = useSettingsStore();
        store.radiaSettings.enabled = true;
        const wrapper = mount(RadiaSettings, {
            global: {
                plugins: [ pinia ]
            }
        });

        const message = wrapper.findComponent('[data-test="radia-disabled-warning"]');
        expect(message.exists()).toEqual(false);
        const radiaConnectionButton = wrapper.findComponent('[data-test="radia-connect-button"]');
        expect(radiaConnectionButton.exists()).toEqual(false);
    });

    it('updates inputs on store change if unfocused', async () => {
        const store = useSettingsStore();
        const wrapper = mount(RadiaSettings, {
            global: {
                plugins: [ pinia ]
            }
        });

        const guildIdInput = wrapper.findComponent<typeof IplInput>('[name="guild-id"]');
        guildIdInput.vm.$emit('focuschange', false);
        store.radiaSettings.guildID = '345345';
        await wrapper.vm.$nextTick();

        expect(guildIdInput.attributes().modelvalue).toEqual('345345');
    });

    it('does not change input value on store change if it is focused', async () => {
        const store = useSettingsStore();
        const wrapper = mount(RadiaSettings, {
            global: {
                plugins: [ pinia ]
            }
        });

        const usernameInput = wrapper.findComponent<typeof IplInput>('[name="guild-id"]');
        usernameInput.vm.$emit('focuschange', true);
        store.radiaSettings.guildID = '345345';
        store.radiaSettings.updateOnImport = false;
        await wrapper.vm.$nextTick();

        expect(usernameInput.attributes().modelvalue).toEqual('123123');
        expect(wrapper.getComponent('[data-test="update-on-import-checkbox"]').attributes().modelvalue)
            .toEqual('false');
    });

    it('updates updateOnInput value on store change', async () => {
        const store = useSettingsStore();
        const wrapper = mount(RadiaSettings, {
            global: {
                plugins: [ pinia ]
            }
        });

        store.radiaSettings.updateOnImport = true;
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="update-on-import-checkbox"]').attributes().modelvalue)
            .toEqual('true');
    });

    it('updates settings on button click if they have been updated', async () => {
        const store = useSettingsStore();
        store.setRadiaSettings = jest.fn();
        const wrapper = mount(RadiaSettings, {
            global: {
                plugins: [ pinia ]
            }
        });

        wrapper.getComponent<typeof IplInput>('[name="guild-id"]').vm.$emit('update:modelValue', '789789');
        wrapper.getComponent<typeof IplButton>('[data-test="update-button"]').vm.$emit('click');

        expect(store.setRadiaSettings).toHaveBeenCalledWith({
            newValue: {
                enabled: null,
                guildID: '789789',
                updateOnImport: null
            }
        });
    });

    it('reverts changes on update button right click', async () => {
        const wrapper = mount(RadiaSettings, {
            global: {
                plugins: [ pinia ]
            }
        });
        const event = new Event(null);
        jest.spyOn(event, 'preventDefault');

        wrapper.getComponent<typeof IplInput>('[name="guild-id"]').vm.$emit('update:modelValue', '789789');
        wrapper.getComponent<typeof IplButton>('[data-test="update-button"]').vm.$emit('rightClick', event);
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[name="guild-id"]').attributes().modelvalue).toEqual('123123');
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('does not update settings on button click if data has not been updated', async () => {
        const store = useSettingsStore();
        store.setRadiaSettings = jest.fn();
        const wrapper = mount(RadiaSettings, {
            global: {
                plugins: [ pinia ]
            }
        });

        wrapper.getComponent<typeof IplButton>('[data-test="update-button"]').vm.$emit('click');

        expect(store.setRadiaSettings).not.toHaveBeenCalled();
    });

    it('has expected button color', async () => {
        const wrapper = mount(RadiaSettings, {
            global: {
                plugins: [ pinia ]
            }
        });

        expect(wrapper.getComponent<typeof IplButton>('[data-test="update-button"]').props().color).toEqual('blue');
    });

    it('has expected button color when data is edited', async () => {
        const wrapper = mount(RadiaSettings, {
            global: {
                plugins: [ pinia ]
            }
        });

        wrapper.getComponent<typeof IplInput>('[name="guild-id"]').vm.$emit('update:modelValue', '890890');
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent<typeof IplButton>('[data-test="update-button"]').props().color).toEqual('red');
    });

    it('disables update button if data is invalid', async () => {
        const wrapper = mount(RadiaSettings, {
            global: {
                plugins: [ pinia ]
            }
        });

        wrapper.getComponent<typeof IplInput>('[name="guild-id"]').vm.$emit('update:modelValue', 'something invalid');
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent<typeof IplButton>('[data-test="update-button"]').props().disabled).toEqual(true);
    });

    it('updates updateOnImport value when relevant checkbox is interacted with', async () => {
        const store = useSettingsStore();
        store.setUpdateOnImport = jest.fn();
        const wrapper = mount(RadiaSettings, {
            global: {
                plugins: [ pinia ]
            }
        });

        wrapper.getComponent<typeof IplCheckbox>('[data-test="update-on-import-checkbox"]').vm.$emit('update:modelValue', true);
        await wrapper.vm.$nextTick();

        expect(store.setUpdateOnImport).toHaveBeenCalledWith(true);
    });
});
