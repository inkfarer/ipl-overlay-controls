import ActiveColorToggles from '../activeColorToggles.vue';
import { createStore } from 'vuex';
import { ActiveRoundStore, activeRoundStoreKey } from '../../../store/activeRoundStore';
import { GameWinner } from 'types/enums/gameWinner';
import { config, mount } from '@vue/test-utils';

describe('ActiveColorToggles', () => {
    config.global.stubs = {
        FontAwesomeIcon: true
    };

    const mockSwapColors = jest.fn();
    const mockSetActiveColor = jest.fn();

    function createActiveRoundStore() {
        return createStore<ActiveRoundStore>({
            state: {
                activeRound: {
                    teamA: {
                        score: 0,
                        id: '123123',
                        name: null,
                        showLogo: true,
                        players: null,
                        color: null
                    },
                    teamB: {
                        score: 2,
                        id: '345345',
                        name: null,
                        showLogo: false,
                        players: null,
                        color: null
                    },
                    activeColor: {
                        categoryName: 'Ranked Modes',
                        index: 0,
                        title: 'coolest color',
                        isCustom: false
                    },
                    round: {
                        id: '0387',
                        name: 'cool round',
                        isCompleted: false
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
                setActiveColor: mockSetActiveColor
            }
        });
    }

    it('matches snapshot', () => {
        const store = createActiveRoundStore();
        const wrapper = mount(ActiveColorToggles, {
            global: {
                plugins: [[store, activeRoundStoreKey]]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('sets color when clicking previous color toggle', async () => {
        const activeRoundStore = createActiveRoundStore();
        const wrapper = mount(ActiveColorToggles, {
            global: {
                plugins: [[activeRoundStore, activeRoundStoreKey]]
            }
        });

        const toggle = wrapper.get('[data-test="color-toggle-previous"]');
        await toggle.trigger('click');

        expect(mockSetActiveColor).toHaveBeenCalledWith(expect.any(Object), {
            categoryName: 'Ranked Modes',
            color: {
                clrA: '#FEF232',
                clrB: '#2ED2FE',
                index: 6,
                isCustom: false,
                title: 'Yellow vs Blue'
            }
        });
    });

    it('sets color when clicking next color toggle', async () => {
        const activeRoundStore = createActiveRoundStore();
        const wrapper = mount(ActiveColorToggles, {
            global: {
                plugins: [[activeRoundStore, activeRoundStoreKey]]
            }
        });

        const toggle = wrapper.get('[data-test="color-toggle-next"]');
        await toggle.trigger('click');

        expect(mockSetActiveColor).toHaveBeenCalledWith(expect.any(Object), {
            categoryName: 'Ranked Modes',
            color: {
                clrA: '#04D976',
                clrB: '#D600AB',
                index: 1,
                isCustom: false,
                title: 'Green vs Magenta'
            }
        });
    });

    it('swaps colors on swap button click', () => {
        const activeRoundStore = createActiveRoundStore();
        const wrapper = mount(ActiveColorToggles, {
            global: {
                plugins: [[activeRoundStore, activeRoundStoreKey]]
            }
        });

        wrapper.getComponent('[data-test="swap-colors-button"]').vm.$emit('click');

        expect(mockSwapColors).toHaveBeenCalled();
    });
});
