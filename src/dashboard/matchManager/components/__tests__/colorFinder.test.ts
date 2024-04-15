import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { config, mount } from '@vue/test-utils';
import { useSettingsStore } from '../../../store/settingsStore';
import { GameVersion } from 'types/enums/gameVersion';
import { useActiveRoundStore } from '../../../store/activeRoundStore';
import ColorFinder from '../colorFinder.vue';

describe('ColorFinder', () => {
    let pinia: TestingPinia;

    config.global.stubs = {
        IplButton: true,
        TeamColorDisplay: true
    };

    beforeEach(() => {
        pinia = createTestingPinia();
        config.global.plugins = [pinia];

        const settingsStore = useSettingsStore();
        // @ts-ignore
        settingsStore.runtimeConfig = { gameVersion: GameVersion.SPLATOON_3 };
        const activeRoundStore = useActiveRoundStore();
        activeRoundStore.swapColorsInternally = false;
    });

    it('matches snapshot', () => {
        const wrapper = mount(ColorFinder, {
            props: {
                colorGroupKey: 'rankedModes'
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot after selecting the first color', async () => {
        const wrapper = mount(ColorFinder, {
            props: {
                colorGroupKey: 'rankedModes'
            }
        });

        await wrapper.get('[data-test="first-color-option_0"]').trigger('click');

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('handles selecting a color', async () => {
        const activeRoundStore = useActiveRoundStore();
        activeRoundStore.setActiveColor = jest.fn();
        const wrapper = mount(ColorFinder, {
            props: {
                colorGroupKey: 'rankedModes'
            }
        });

        await wrapper.get('[data-test="first-color-option_0"]').trigger('click');
        await wrapper.get('[data-test="second-color-option_1"]').trigger('click');
        await wrapper.get('[data-test="apply-button"]').trigger('click');

        expect(activeRoundStore.setActiveColor).toHaveBeenCalledWith({
            categoryKey: 'rankedModes',
            categoryName: 'Ranked Modes',
            color: {
                clrA: '#FC7735',
                clrB: '#4048DB',
                clrNeutral: '#F8F755',
                index: 3,
                isCustom: false,
                key: 'orangeDarkBlue',
                title: 'Orange vs Dark Blue'
            }
        });
        expect(wrapper.emitted('close')).toEqual([[]]);
    });

    it('handles selecting a color when colors are swapped', async () => {
        const activeRoundStore = useActiveRoundStore();
        activeRoundStore.swapColorsInternally = true;
        activeRoundStore.setActiveColor = jest.fn();
        const wrapper = mount(ColorFinder, {
            props: {
                colorGroupKey: 'rankedModes'
            }
        });

        await wrapper.get('[data-test="first-color-option_0"]').trigger('click');
        await wrapper.get('[data-test="second-color-option_1"]').trigger('click');
        await wrapper.get('[data-test="apply-button"]').trigger('click');

        expect(activeRoundStore.setActiveColor).toHaveBeenCalledWith({
            categoryKey: 'rankedModes',
            categoryName: 'Ranked Modes',
            color: {
                clrA: '#4048DB',
                clrB: '#FC7735',
                clrNeutral: '#F8F755',
                index: 3,
                isCustom: false,
                key: 'orangeDarkBlue',
                title: 'Orange vs Dark Blue'
            }
        });
        expect(wrapper.emitted('close')).toEqual([[]]);
    });

    it('does not require selecting a second color if the first option only has one color combination', async () => {
        const activeRoundStore = useActiveRoundStore();
        activeRoundStore.setActiveColor = jest.fn();
        const wrapper = mount(ColorFinder, {
            props: {
                colorGroupKey: 'rankedModes'
            }
        });

        await wrapper.get('[data-test="first-color-option_3"]').trigger('click');
        await wrapper.get('[data-test="apply-button"]').trigger('click');

        expect(activeRoundStore.setActiveColor).toHaveBeenCalledWith({
            categoryKey: 'rankedModes',
            categoryName: 'Ranked Modes',
            color: {
                clrA: '#2C2CDB',
                clrB: '#F29C33',
                clrNeutral: '#FF67EE',
                index: 5,
                isCustom: false,
                key: 'darkBlueOrange',
                title: 'Dark Blue vs Orange'
            }
        });
        expect(wrapper.emitted('close')).toEqual([[]]);
    });

    it('handles cancelling color selection', async () => {
        const wrapper = mount(ColorFinder, {
            props: {
                colorGroupKey: 'rankedModes'
            }
        });

        await wrapper.get('[data-test="cancel-button"]').trigger('click');

        expect(wrapper.emitted('close')).toEqual([[]]);
    });
});
