import ActiveColorToggles from '../activeColorToggles.vue';
import { useActiveRoundStore } from '../../../store/activeRoundStore';
import { GameWinner } from 'types/enums/gameWinner';
import { config, flushPromises, mount } from '@vue/test-utils';
import { PlayType } from 'types/enums/playType';
import { GameVersion } from 'types/enums/gameVersion';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { useSettingsStore } from '../../../store/settingsStore';
import { IplButton } from '@iplsplatoon/vue-components';
import { useObsStore } from '../../../store/obsStore';
import { ObsStatus } from 'types/enums/ObsStatus';
import { mockSendMessage } from '../../../__mocks__/mockNodecg';

describe('ActiveColorToggles', () => {
    let pinia: TestingPinia;

    config.global.stubs = {
        FontAwesomeIcon: true
    };

    afterEach(() => {
        jest.useRealTimers();
    });

    beforeEach(() => {
        pinia = createTestingPinia();
        config.global.plugins = [pinia];

        const obsStore = useObsStore();
        obsStore.obsState = { enabled: false, status: ObsStatus.NOT_CONNECTED };

        const activeRoundStore = useActiveRoundStore();
        activeRoundStore.getNextAndPreviousColors = jest.fn().mockResolvedValue({
            nextColor: {
                categoryName: 'Ranked Modes',
                clrA: '#FEF232',
                clrB: '#2ED2FE',
                clrNeutral: '#FD5600',
                index: 6,
                isCustom: false,
                title: 'Yellow vs Blue'
            },
            previousColor: {
                categoryName: 'Ranked Modes',
                clrA: '#04D976',
                clrB: '#D600AB',
                clrNeutral: '#D2E500',
                index: 1,
                isCustom: false,
                title: 'Green vs Magenta'
            }
        });
        activeRoundStore.$state = {
            activeRound: {
                teamA: {
                    score: 0,
                    id: '123123',
                    name: 'Team One',
                    showLogo: true,
                    players: null,
                    color: null
                },
                teamB: {
                    score: 2,
                    id: '345345',
                    name: 'Team Two (Really long name for testing ;))',
                    showLogo: false,
                    players: null,
                    color: null
                },
                activeColor: {
                    categoryName: 'Ranked Modes',
                    categoryKey: 'rankedModes',
                    index: 0,
                    title: 'coolest color',
                    colorKey: 'coolestColor',
                    isCustom: false,
                    clrNeutral: '#0FAA00'
                },
                match: {
                    id: '01010',
                    name: 'Rad Match',
                    isCompleted: false,
                    type: PlayType.BEST_OF
                },
                games: [
                    {
                        winner: GameWinner.BRAVO,
                        stage: null,
                        mode: null
                    },
                    {
                        winner: GameWinner.BRAVO,
                        stage: null,
                        mode: null
                    },
                    {
                        winner: GameWinner.NO_WINNER,
                        stage: null,
                        mode: null
                    },
                ],
            },
            swapColorsInternally: false
        };

        useSettingsStore().$state = {
            // @ts-ignore
            runtimeConfig: {
                gameVersion: GameVersion.SPLATOON_2
            }
        };
    });

    it('matches snapshot', async () => {
        const wrapper = mount(ActiveColorToggles);
        await flushPromises();

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot with swapped colors', async () => {
        const store = useActiveRoundStore();
        store.swapColorsInternally = true;
        const wrapper = mount(ActiveColorToggles);
        await flushPromises();

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('sets color when clicking previous color toggle', async () => {
        const activeRoundStore = useActiveRoundStore();
        activeRoundStore.switchToPreviousColor = jest.fn();
        const wrapper = mount(ActiveColorToggles);

        const toggle = wrapper.get('[data-test="color-toggle-previous"]');
        await toggle.trigger('click');

        expect(activeRoundStore.switchToPreviousColor).toHaveBeenCalled();
    });

    it('sets color when clicking next color toggle', async () => {
        const activeRoundStore = useActiveRoundStore();
        activeRoundStore.switchToNextColor = jest.fn();
        const wrapper = mount(ActiveColorToggles);

        const toggle = wrapper.get('[data-test="color-toggle-next"]');
        await toggle.trigger('click');

        expect(activeRoundStore.switchToNextColor).toHaveBeenCalled();
    });

    it('disables color toggles when the next and previous colors match the current one', async () => {
        const activeRoundStore = useActiveRoundStore();
        (activeRoundStore.getNextAndPreviousColors as jest.Mock).mockResolvedValue({
            nextColor: {
                index: 0,
                title: 'Blue vs Orange',
                clrA: '#2D63D7',
                clrB: '#FDB605',
                clrNeutral: '#8FD20C',
                isCustom: false,
                categoryName: 'Color Lock (Variant 2)'
            },
            previousColor: {
                index: 0,
                title: 'Blue vs Orange',
                clrA: '#2D63D7',
                clrB: '#FDB605',
                clrNeutral: '#8FD20C',
                isCustom: false,
                categoryName: 'Color Lock (Variant 2)'
            }
        });

        const wrapper = mount(ActiveColorToggles);
        await flushPromises();

        const toggles = wrapper.findAll('.color-toggle');

        expect(toggles.every(toggle => toggle.classes().includes('disabled'))).toEqual(true);
    });

    it('disables color toggles when a custom color is selected', async () => {
        const activeRoundStore = useActiveRoundStore();
        activeRoundStore.activeRound.activeColor.isCustom = true;

        const wrapper = mount(ActiveColorToggles);
        await flushPromises();

        const toggles = wrapper.findAll('.color-toggle');

        expect(toggles.every(toggle => toggle.classes().includes('disabled'))).toEqual(true);
    });

    it('swaps colors on swap button click', () => {
        const activeRoundStore = useActiveRoundStore();
        activeRoundStore.swapColors = jest.fn();
        const wrapper = mount(ActiveColorToggles);

        wrapper.getComponent<typeof IplButton>('[data-test="swap-colors-button"]').vm.$emit('click');

        expect(activeRoundStore.swapColors).toHaveBeenCalled();
    });

    it('does not show button for reading colors from obs if obs socket is disabled', () => {
        const obsStore = useObsStore();
        obsStore.obsState = { enabled: false, status: ObsStatus.NOT_CONNECTED };
        const wrapper = mount(ActiveColorToggles);

        expect(wrapper.find('[data-test="read-colors-from-source-button"]').exists()).toEqual(false);
        expect(wrapper.find('[data-test="missing-gameplay-input-warning"]').exists()).toEqual(false);
    });

    it('handles reading colors from OBS', () => {
        const obsStore = useObsStore();
        obsStore.obsState = { enabled: true, status: ObsStatus.CONNECTED };
        const wrapper = mount(ActiveColorToggles);

        wrapper.getComponent<typeof IplButton>('[data-test="read-colors-from-source-button"]').vm.$emit('click');

        expect(mockSendMessage).toHaveBeenCalledWith('setActiveColorsFromGameplaySource', undefined);
    });

    it('displays a warning if some OBS config becomes unset', async () => {
        jest.useFakeTimers();
        const obsStore = useObsStore();
        obsStore.obsState = { enabled: true, status: ObsStatus.CONNECTED };
        // @ts-ignore
        obsStore.currentConfig = {
            gameplayInput: 'Video Capture Device',
            gameplayScene: 'gameplay',
            intermissionScene: 'intermission'
        };
        const wrapper = mount(ActiveColorToggles);

        // @ts-ignore
        obsStore.currentConfig = {
            gameplayInput: 'Video Capture Device',
            gameplayScene: undefined,
            intermissionScene: 'intermission'
        };
        jest.runAllTimers();
        await wrapper.vm.$nextTick();

        const warningElem = wrapper.find('[data-test="missing-gameplay-input-warning"]');
        expect(warningElem.exists()).toEqual(true);
        expect(warningElem.text()).toEqual('translation:missingObsConfigWarning');
    });

    it('displays a warning if some OBS config values are not valid', async () => {
        jest.useFakeTimers();
        const obsStore = useObsStore();
        obsStore.obsState = {
            enabled: true,
            status: ObsStatus.CONNECTED,
            scenes: ['gameplay', 'intermission', 'scene3'],
            inputs: [
                { name: 'Video Capture Device', noVideoOutput: false }
            ]
        };
        // @ts-ignore
        obsStore.currentConfig = {
            gameplayInput: 'Video Capture Device',
            gameplayScene: 'gameplay',
            intermissionScene: 'intermission'
        };
        const wrapper = mount(ActiveColorToggles);

        obsStore.obsState = {
            enabled: true,
            status: ObsStatus.CONNECTED,
            scenes: ['gameplay', 'scene3'],
            inputs: [
                { name: 'Video Capture Device', noVideoOutput: false }
            ]
        };
        jest.runAllTimers();
        await wrapper.vm.$nextTick();

        const warningElem = wrapper.find('[data-test="missing-gameplay-input-warning"]');
        expect(warningElem.exists()).toEqual(true);
        expect(warningElem.text()).toEqual('translation:missingObsConfigWarning');
    });

    it('does not display a warning if OBS config is all valid', () => {
        const obsStore = useObsStore();
        obsStore.obsState = {
            enabled: true,
            status: ObsStatus.CONNECTED,
            scenes: ['gameplay', 'intermission', 'scene3'],
            inputs: [
                { name: 'Video Capture Device', noVideoOutput: false }
            ]
        };
        // @ts-ignore
        obsStore.currentConfig = {
            gameplayInput: 'Video Capture Device',
            gameplayScene: 'gameplay',
            intermissionScene: 'intermission'
        };
        const wrapper = mount(ActiveColorToggles);

        const warningElem = wrapper.find('[data-test="missing-gameplay-input-warning"]');
        expect(warningElem.exists()).toEqual(false);
    });
});
