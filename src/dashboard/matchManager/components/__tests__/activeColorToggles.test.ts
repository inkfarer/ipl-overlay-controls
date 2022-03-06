import ActiveColorToggles from '../activeColorToggles.vue';
import { createStore } from 'vuex';
import { useActiveRoundStore } from '../../../store/activeRoundStore';
import { GameWinner } from 'types/enums/gameWinner';
import { config, flushPromises, mount } from '@vue/test-utils';
import { PlayType } from 'types/enums/playType';
import { GameVersion } from 'types/enums/gameVersion';
import { settingsStoreKey } from '../../../settings/settingsStore';
import { createTestingPinia, TestingPinia } from '@pinia/testing';

describe('ActiveColorToggles', () => {
    let pinia: TestingPinia;

    config.global.stubs = {
        FontAwesomeIcon: true
    };

    beforeEach(() => {
        pinia = createTestingPinia();

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
        };
    });

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
        const settingsStore = createSettingsStore();
        const wrapper = mount(ActiveColorToggles, {
            global: {
                plugins: [
                    pinia,
                    [settingsStore, settingsStoreKey]
                ]
            }
        });
        await flushPromises();

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot with swapped colors', async () => {
        const store = useActiveRoundStore();
        store.swapColorsInternally = true;
        const settingsStore = createSettingsStore();
        const wrapper = mount(ActiveColorToggles, {
            global: {
                plugins: [
                    pinia,
                    [settingsStore, settingsStoreKey]
                ]
            }
        });
        await flushPromises();

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('sets color when clicking previous color toggle', async () => {
        const activeRoundStore = useActiveRoundStore();
        activeRoundStore.switchToPreviousColor = jest.fn();
        const settingsStore = createSettingsStore();
        const wrapper = mount(ActiveColorToggles, {
            global: {
                plugins: [
                    pinia,
                    [settingsStore, settingsStoreKey]
                ]
            }
        });

        const toggle = wrapper.get('[data-test="color-toggle-previous"]');
        await toggle.trigger('click');

        expect(activeRoundStore.switchToPreviousColor).toHaveBeenCalled();
    });

    it('sets color when clicking next color toggle', async () => {
        const activeRoundStore = useActiveRoundStore();
        activeRoundStore.switchToNextColor = jest.fn();
        const settingsStore = createSettingsStore();
        const wrapper = mount(ActiveColorToggles, {
            global: {
                plugins: [
                    pinia,
                    [settingsStore, settingsStoreKey]
                ]
            }
        });

        const toggle = wrapper.get('[data-test="color-toggle-next"]');
        await toggle.trigger('click');

        expect(activeRoundStore.switchToNextColor).toHaveBeenCalled();
    });

    it('swaps colors on swap button click', () => {
        const activeRoundStore = useActiveRoundStore();
        activeRoundStore.swapColors = jest.fn();
        const settingsStore = createSettingsStore();
        const wrapper = mount(ActiveColorToggles, {
            global: {
                plugins: [
                    pinia,
                    [settingsStore, settingsStoreKey]
                ]
            }
        });

        wrapper.getComponent('[data-test="swap-colors-button"]').vm.$emit('click');

        expect(activeRoundStore.swapColors).toHaveBeenCalled();
    });
});
