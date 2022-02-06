import SetEditor from '../setEditor.vue';
import { createStore } from 'vuex';
import { ActiveRoundStore, activeRoundStoreKey } from '../../../store/activeRoundStore';
import { GameWinner } from 'types/enums/gameWinner';
import { config, mount } from '@vue/test-utils';
import { ActiveRoundGame } from 'types/activeRoundGame';

describe('setEditor', () => {
    config.global.stubs = {
        IplButton: true,
        IplInput: true,
        IplSelect: true,
        IplToggleButton: true,
        IplCheckbox: true
    };

    const mockSetWinnerForIndex = jest.fn();
    const mockSwapRoundColor = jest.fn();
    const mockUpdateActiveGames = jest.fn();
    const mockResetActiveRound = jest.fn();

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
                    match: {
                        id: '01010',
                        name: 'Rad Match',
                        isCompleted: false
                    },
                    games: [
                        {
                            winner: GameWinner.BRAVO,
                            stage: 'Blackbelly Skatepark',
                            mode: 'Rainmaker',
                            color: {
                                index: 2,
                                title: 'Cool Color',
                                clrA: '#123123',
                                clrB: '#345345',
                                categoryName: 'Cool Colors',
                                isCustom: false,
                                colorsSwapped: false
                            }
                        },
                        {
                            winner: GameWinner.BRAVO,
                            stage: 'MakoMart',
                            mode: 'Tower Control',
                            color: {
                                index: 0,
                                title: 'Cool Color',
                                clrA: '#837693',
                                clrB: '#206739',
                                categoryName: 'Custom Color',
                                isCustom: true,
                                colorsSwapped: true
                            }
                        },
                        {
                            winner: GameWinner.NO_WINNER,
                            stage: 'Camp Triggerfish',
                            mode: 'Splat Zones'
                        },
                        {
                            winner: GameWinner.NO_WINNER,
                            stage: 'Humpback Pump Track',
                            mode: 'Clam Blitz'
                        },
                        {
                            winner: GameWinner.NO_WINNER,
                            stage: 'Inkblot Art Academy',
                            mode: 'Splat Zones'
                        }
                    ],
                },
                swapColorsInternally: false
            },
            actions: {
                setWinnerForIndex: mockSetWinnerForIndex,
                resetActiveRound: mockResetActiveRound,
                swapRoundColor: mockSwapRoundColor,
                updateActiveGames: mockUpdateActiveGames
            }
        });
    }

    it('matches snapshot', () => {
        const store = createActiveRoundStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [ [ store, activeRoundStoreKey ] ]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot with no upcoming round', () => {
        const store = createActiveRoundStore();
        store.state.activeRound.games = [
            {
                winner: GameWinner.BRAVO,
                stage: 'Blackbelly Skatepark',
                mode: 'Rainmaker',
                color: {
                    index: 2,
                    title: 'Cool Color',
                    clrA: '#123123',
                    clrB: '#345345',
                    categoryName: 'Cool Colors',
                    isCustom: false,
                    colorsSwapped: false
                }
            },
            {
                winner: GameWinner.BRAVO,
                stage: 'MakoMart',
                mode: 'Tower Control',
                color: {
                    index: 0,
                    title: 'Cool Color',
                    clrA: '#837693',
                    clrB: '#206739',
                    categoryName: 'Custom Color',
                    isCustom: true,
                    colorsSwapped: true
                }
            },
            {
                winner: GameWinner.ALPHA,
                stage: 'Camp Triggerfish',
                mode: 'Splat Zones',
                color: {
                    index: 0,
                    title: 'Cool Color',
                    clrA: '#837693',
                    clrB: '#206739',
                    categoryName: 'Custom Color',
                    isCustom: true,
                    colorsSwapped: true
                }
            },
        ];
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [ [ store, activeRoundStoreKey ] ]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot when editing colors', async () => {
        const store = createActiveRoundStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [ [ store, activeRoundStoreKey ] ]
            }
        });

        wrapper.getComponent('[data-test="edit-colors-toggle"]').vm.$emit('update:modelValue', true);
        await wrapper.vm.$nextTick();

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('handles round reset', () => {
        const store = createActiveRoundStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [ [ store, activeRoundStoreKey ] ]
            }
        });

        wrapper.getComponent('[data-test="reset-button"]').vm.$emit('click');

        expect(mockResetActiveRound).toHaveBeenCalledTimes(1);
    });

    it('handles round update', () => {
        const store = createActiveRoundStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [ [ store, activeRoundStoreKey ] ]
            }
        });

        wrapper.getComponent('[data-test="set-editor-0"] > [data-test="stage-select"]')
            .vm.$emit('update:modelValue', 'Moray Towers');
        wrapper.getComponent('[data-test="update-button"]').vm.$emit('click');

        expect(mockUpdateActiveGames).toHaveBeenCalledWith(expect.any(Object), [
            {
                color: {
                    categoryName: 'Cool Colors',
                    clrA: '#123123',
                    clrB: '#345345',
                    colorsSwapped: false,
                    index: 2,
                    isCustom: false,
                    title: 'Cool Color',
                },
                mode: 'Rainmaker',
                stage: 'Moray Towers',
                winner: GameWinner.BRAVO,
            },
            {
                color: {
                    categoryName: 'Custom Color',
                    clrA: '#837693',
                    clrB: '#206739',
                    colorsSwapped: true,
                    index: 0,
                    isCustom: true,
                    title: 'Cool Color',
                },
                mode: 'Tower Control',
                stage: 'MakoMart',
                winner: GameWinner.BRAVO,
            },
            {
                mode: 'Splat Zones',
                stage: 'Camp Triggerfish',
                winner: GameWinner.NO_WINNER,
            },
            {
                mode: 'Clam Blitz',
                stage: 'Humpback Pump Track',
                winner: GameWinner.NO_WINNER,
            },
            {
                mode: 'Splat Zones',
                stage: 'Inkblot Art Academy',
                winner: GameWinner.NO_WINNER,
            },
        ]);
    });

    it('has expected button color after changing round data', async () => {
        const store = createActiveRoundStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [ [ store, activeRoundStoreKey ] ]
            }
        });
        const updateButton = wrapper.getComponent('[data-test="update-button"]');

        expect(updateButton.attributes().color).toEqual('blue');

        wrapper.getComponent('[data-test="set-editor-0"] > [data-test="stage-select"]')
            .vm.$emit('update:modelValue', 'Moray Towers');
        await wrapper.vm.$nextTick();

        expect(updateButton.attributes().color).toEqual('red');
    });

    it('handles stage change', () => {
        const store = createActiveRoundStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [ [ store, activeRoundStoreKey ] ]
            }
        });

        wrapper.getComponent('[data-test="set-editor-1"] > [data-test="stage-select"]')
            .vm.$emit('update:modelValue', 'Moray Towers');

        expect((wrapper.vm as unknown as { games: ActiveRoundGame[] }).games[1].stage).toEqual('Moray Towers');
    });

    it('handles mode change', () => {
        const store = createActiveRoundStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [ [ store, activeRoundStoreKey ] ]
            }
        });

        wrapper.getComponent('[data-test="set-editor-1"] > [data-test="mode-select"]')
            .vm.$emit('update:modelValue', 'Turf War');

        expect((wrapper.vm as unknown as { games: ActiveRoundGame[] }).games[1].mode).toEqual('Turf War');
    });

    it('handles winner change to none', async () => {
        const store = createActiveRoundStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [ [ store, activeRoundStoreKey ] ]
            }
        });

        wrapper.getComponent('[data-test="set-editor-1"] [data-test="set-winner-button-none"]').vm.$emit('click');

        expect(mockSetWinnerForIndex)
            .toHaveBeenCalledWith(expect.any(Object), { index: 1, winner: GameWinner.NO_WINNER });
    });

    it('handles winner change to alpha', async () => {
        const store = createActiveRoundStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [ [ store, activeRoundStoreKey ] ]
            }
        });

        wrapper.getComponent('[data-test="set-editor-2"] [data-test="set-winner-button-a"]').vm.$emit('click');

        expect(mockSetWinnerForIndex)
            .toHaveBeenCalledWith(expect.any(Object), { index: 2, winner: GameWinner.ALPHA });
    });

    it('handles winner change to bravo', async () => {
        const store = createActiveRoundStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [ [ store, activeRoundStoreKey ] ]
            }
        });

        wrapper.getComponent('[data-test="set-editor-2"] [data-test="set-winner-button-b"]').vm.$emit('click');

        expect(mockSetWinnerForIndex)
            .toHaveBeenCalledWith(expect.any(Object), { index: 2, winner: GameWinner.BRAVO });
    });

    it('handles color change', async () => {
        const store = createActiveRoundStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [ [ store, activeRoundStoreKey ] ]
            }
        });

        wrapper.getComponent('[data-test="set-editor-0"] [data-test="color-select"]')
            .vm.$emit('update:modelValue', 'Ranked Modes_1');

        expect((wrapper.vm as unknown as { games: ActiveRoundGame[] }).games[0].color).toEqual({
            categoryName: 'Ranked Modes',
            clrA: '#04D976',
            clrB: '#D600AB',
            colorsSwapped: false,
            index: 1,
            isCustom: false,
            title: 'Green vs Magenta'
        });
    });

    it('handles custom color change', async () => {
        const store = createActiveRoundStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [ [ store, activeRoundStoreKey ] ]
            }
        });

        wrapper.getComponent('[data-test="set-editor-0"] [data-test="custom-color-select-a"]')
            .vm.$emit('update:modelValue', '#234234');
        wrapper.getComponent('[data-test="set-editor-0"] [data-test="custom-color-select-b"]')
            .vm.$emit('update:modelValue', '#567567');

        expect((wrapper.vm as unknown as { games: ActiveRoundGame[] }).games[0].color).toEqual({
            categoryName: 'Cool Colors',
            clrA: '#234234',
            clrB: '#567567',
            colorsSwapped: false,
            index: 2,
            isCustom: false,
            title: 'Cool Color'
        });
    });

    it('handles game color being set to custom', async () => {
        const store = createActiveRoundStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [ [ store, activeRoundStoreKey ] ]
            }
        });

        wrapper.getComponent('[data-test="set-editor-0"] [data-test="custom-color-toggle"]')
            .vm.$emit('update:modelValue', true);

        expect((wrapper.vm as unknown as { games: ActiveRoundGame[] }).games[0].color).toEqual({
            categoryName: 'Custom Color',
            clrA: '#123123',
            clrB: '#345345',
            colorsSwapped: false,
            index: 0,
            isCustom: true,
            title: 'Custom Color'
        });
    });

    it('handles game color being set off custom', async () => {
        const store = createActiveRoundStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [ [ store, activeRoundStoreKey ] ]
            }
        });

        wrapper.getComponent('[data-test="set-editor-0"] [data-test="custom-color-toggle"]')
            .vm.$emit('update:modelValue', false);

        expect((wrapper.vm as unknown as { games: ActiveRoundGame[] }).games[0].color).toEqual({
            categoryName: 'Custom Color',
            clrA: '#123123',
            clrB: '#345345',
            colorsSwapped: false,
            index: 0,
            isCustom: false,
            title: 'Custom Color'
        });
    });

    it('handles game colors getting swapped', async () => {
        const store = createActiveRoundStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [ [ store, activeRoundStoreKey ] ]
            }
        });

        wrapper.getComponent('[data-test="set-editor-0"] [data-test="swap-colors-toggle"]')
            .vm.$emit('update:modelValue', true);

        expect(mockSwapRoundColor).toHaveBeenCalledWith(expect.any(Object), { roundIndex: 0, colorsSwapped: true });
    });

    it('does not revert local changes on store update', async () => {
        const store = createActiveRoundStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [ [ store, activeRoundStoreKey ] ]
            }
        });

        wrapper.getComponent('[data-test="set-editor-0"] > [data-test="stage-select"]')
            .vm.$emit('update:modelValue', 'Camp Triggerfish');
        wrapper.getComponent('[data-test="set-editor-0"] > [data-test="mode-select"]')
            .vm.$emit('update:modelValue', 'Splat Zones');
        wrapper.getComponent('[data-test="set-editor-0"] [data-test="color-select"]')
            .vm.$emit('update:modelValue', 'Ranked Modes_2');
        store.state.activeRound.games = [
            {
                winner: GameWinner.NO_WINNER,
                stage: 'Blackbelly Skatepark',
                mode: 'Rainmaker',
                color: {
                    index: 2,
                    title: 'Cool Color',
                    clrA: '#123123',
                    clrB: '#345345',
                    categoryName: 'Cool Colors',
                    isCustom: false,
                    colorsSwapped: false
                }
            },
            {
                winner: GameWinner.BRAVO,
                stage: 'MakoMart',
                mode: 'Tower Control',
                color: {
                    index: 0,
                    title: 'Cool Color',
                    clrA: '#837693',
                    clrB: '#206739',
                    categoryName: 'Custom Color',
                    isCustom: true,
                    colorsSwapped: true
                }
            },
            {
                winner: GameWinner.NO_WINNER,
                stage: 'Camp Triggerfish',
                mode: 'Splat Zones'
            },
        ];
        await wrapper.vm.$nextTick();

        expect((wrapper.vm as unknown as { games: ActiveRoundGame[] }).games[0]).toEqual({
            winner: GameWinner.NO_WINNER,
            stage: 'Camp Triggerfish',
            mode: 'Splat Zones',
            color: {
                index: 2,
                title: 'Turquoise vs Orange',
                clrA: '#10E38F',
                clrB: '#FB7B08',
                categoryName: 'Ranked Modes',
                isCustom: false,
                colorsSwapped: false
            }
        });
    });

    it('matches snapshot when active round updates to one with less games than the previous one', async () => {
        const store = createActiveRoundStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [ [ store, activeRoundStoreKey ] ]
            }
        });

        store.state.activeRound.games = [
            {
                winner: GameWinner.NO_WINNER,
                stage: 'Blackbelly Skatepark',
                mode: 'Rainmaker',
                color: {
                    index: 2,
                    title: 'Cool Color',
                    clrA: '#123123',
                    clrB: '#345345',
                    categoryName: 'Cool Colors',
                    isCustom: false,
                    colorsSwapped: false
                }
            },
            {
                winner: GameWinner.BRAVO,
                stage: 'MakoMart',
                mode: 'Tower Control',
                color: {
                    index: 0,
                    title: 'Cool Color',
                    clrA: '#837693',
                    clrB: '#206739',
                    categoryName: 'Custom Color',
                    isCustom: true,
                    colorsSwapped: true
                }
            },
            {
                winner: GameWinner.NO_WINNER,
                stage: 'Camp Triggerfish',
                mode: 'Splat Zones'
            },
        ];
        await wrapper.vm.$nextTick();

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot when active round updates to one with more games than the previous one', async () => {
        const store = createActiveRoundStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [ [ store, activeRoundStoreKey ] ]
            }
        });

        store.state.activeRound.games = [
            {
                winner: GameWinner.NO_WINNER,
                stage: 'Blackbelly Skatepark',
                mode: 'Rainmaker',
                color: {
                    index: 2,
                    title: 'Cool Color',
                    clrA: '#123123',
                    clrB: '#345345',
                    categoryName: 'Cool Colors',
                    isCustom: false,
                    colorsSwapped: false
                }
            },
            {
                winner: GameWinner.BRAVO,
                stage: 'MakoMart',
                mode: 'Tower Control',
                color: {
                    index: 0,
                    title: 'Cool Color',
                    clrA: '#837693',
                    clrB: '#206739',
                    categoryName: 'Custom Color',
                    isCustom: true,
                    colorsSwapped: true
                }
            },
            {
                winner: GameWinner.NO_WINNER,
                stage: 'Camp Triggerfish',
                mode: 'Splat Zones'
            },
            {
                winner: GameWinner.NO_WINNER,
                stage: 'Starfish Mainstage',
                mode: 'Splat Zones'
            },
            {
                winner: GameWinner.NO_WINNER,
                stage: 'The Reef',
                mode: 'Splat Zones'
            },
            {
                winner: GameWinner.NO_WINNER,
                stage: 'Camp Triggerfish',
                mode: 'Splat Zones'
            },
            {
                winner: GameWinner.NO_WINNER,
                stage: 'Musselforge Fitness',
                mode: 'Splat Zones'
            },
        ];
        await wrapper.vm.$nextTick();

        expect(wrapper.html()).toMatchSnapshot();
    });
});
