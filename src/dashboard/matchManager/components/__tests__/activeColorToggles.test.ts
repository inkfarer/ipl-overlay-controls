import ActiveColorToggles from '../activeColorToggles.vue';
import { createStore } from 'vuex';
import { ActiveRoundStore, activeRoundStoreKey } from '../../../store/activeRoundStore';
import { GameWinner } from 'types/enums/gameWinner';
import { config, flushPromises, mount } from '@vue/test-utils';
import { PlayType } from 'types/enums/playType';
import { GameVersion } from 'types/enums/gameVersion';
import { settingsStoreKey } from '../../../settings/settingsStore';

describe('ActiveColorToggles', () => {
    config.global.stubs = {
        FontAwesomeIcon: true
    };

    const mockSwapColors = jest.fn();
    const mockSwitchToNextColor = jest.fn();
    const mockSwitchToPreviousColor = jest.fn();
    const mockGetNextAndPreviousColors = jest.fn().mockResolvedValue({
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

    function createActiveRoundStore() {
        return createStore<ActiveRoundStore>({
            state: {
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
                        index: 0,
                        title: 'coolest color',
                        isCustom: false,
                        clrNeutral: '#0FAA00',
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
            },
            actions: {
                swapColors: mockSwapColors,
                switchToNextColor: mockSwitchToNextColor,
                switchToPreviousColor: mockSwitchToPreviousColor,
                getNextAndPreviousColors: mockGetNextAndPreviousColors,
            }
        });
    }

    function createSettingsStore() {
        return createStore({
            state: {
                runtimeConfig: {
                    gameVersion: GameVersion.SPLATOON_2
                }
            }
        });
    }

    it('matches snapshot', async () => {
        const store = createActiveRoundStore();
        const settingsStore = createSettingsStore();
        const wrapper = mount(ActiveColorToggles, {
            global: {
                plugins: [
                    [store, activeRoundStoreKey],
                    [settingsStore, settingsStoreKey]
                ]
            }
        });
        await flushPromises();

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot with swapped colors', async () => {
        const store = createActiveRoundStore();
        store.state.swapColorsInternally = true;
        const settingsStore = createSettingsStore();
        const wrapper = mount(ActiveColorToggles, {
            global: {
                plugins: [
                    [store, activeRoundStoreKey],
                    [settingsStore, settingsStoreKey]
                ]
            }
        });
        await flushPromises();

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('sets color when clicking previous color toggle', async () => {
        const activeRoundStore = createActiveRoundStore();
        const settingsStore = createSettingsStore();
        const wrapper = mount(ActiveColorToggles, {
            global: {
                plugins: [
                    [activeRoundStore, activeRoundStoreKey],
                    [settingsStore, settingsStoreKey]
                ]
            }
        });

        const toggle = wrapper.get('[data-test="color-toggle-previous"]');
        await toggle.trigger('click');

        expect(mockSwitchToPreviousColor).toHaveBeenCalled();
    });

    it('sets color when clicking next color toggle', async () => {
        const activeRoundStore = createActiveRoundStore();
        const settingsStore = createSettingsStore();
        const wrapper = mount(ActiveColorToggles, {
            global: {
                plugins: [
                    [activeRoundStore, activeRoundStoreKey],
                    [settingsStore, settingsStoreKey]
                ]
            }
        });

        const toggle = wrapper.get('[data-test="color-toggle-next"]');
        await toggle.trigger('click');

        expect(mockSwitchToNextColor).toHaveBeenCalled();
    });

    it('swaps colors on swap button click', () => {
        const activeRoundStore = createActiveRoundStore();
        const settingsStore = createSettingsStore();
        const wrapper = mount(ActiveColorToggles, {
            global: {
                plugins: [
                    [activeRoundStore, activeRoundStoreKey],
                    [settingsStore, settingsStoreKey]
                ]
            }
        });

        wrapper.getComponent('[data-test="swap-colors-button"]').vm.$emit('click');

        expect(mockSwapColors).toHaveBeenCalled();
    });
});
