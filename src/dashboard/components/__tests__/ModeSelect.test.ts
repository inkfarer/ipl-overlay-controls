import { config, shallowMount } from '@vue/test-utils';
import ModeSelect from '../ModeSelect.vue';
import { useSettingsStore } from '../../store/settingsStore';
import { GameVersion } from 'types/enums/gameVersion';
import { Locale } from 'types/enums/Locale';
import { createTestingPinia, TestingPinia } from '@pinia/testing';

describe('ModeSelect', () => {
    let pinia: TestingPinia;

    beforeEach(() => {
        pinia = createTestingPinia();

        config.global.plugins = [pinia];

        useSettingsStore().runtimeConfig = {
            gameVersion: GameVersion.SPLATOON_2,
            locale: Locale.EN
        };
    });

    it('emits expected event when new option is selected', () => {
        const wrapper = shallowMount(ModeSelect);

        wrapper.findComponent('ipl-select-stub').vm.$emit('update:modelValue', 'New Stage');

        expect(wrapper.emitted()['update:modelValue'][0]).toEqual(['New Stage']);
    });

    it.each(Object.values(Locale))('adds expected options to select when language is %s', locale => {
        useSettingsStore().runtimeConfig.locale = locale;

        const wrapper = shallowMount(ModeSelect);

        expect((wrapper.findComponent('ipl-select-stub').vm as unknown as { options: unknown }).options).toMatchSnapshot();
    });
});
