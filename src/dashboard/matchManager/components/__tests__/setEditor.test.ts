import SetEditor from '../setEditor.vue';
import { createStore } from 'vuex';
import { useActiveRoundStore } from '../../../store/activeRoundStore';
import { GameWinner } from 'types/enums/gameWinner';
import { config, mount } from '@vue/test-utils';
import { ActiveRoundGame } from 'types/activeRoundGame';
import { PlayType } from 'types/enums/playType';
import { GameVersion } from 'types/enums/gameVersion';
import { settingsStoreKey } from '../../../settings/settingsStore';
import { createTestingPinia, TestingPinia } from '@pinia/testing';

describe('setEditor', () => {
    let pinia: TestingPinia;
    config.global.stubs = {
        IplButton: true,
        IplInput: true,
        IplSelect: true,
        IplToggleButton: true,
        IplCheckbox: true
    };

    beforeEach(() => {
        pinia = createTestingPinia();

        useActiveRoundStore().$state = {
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
                    isCustom: false,
                    clrNeutral: '#00AAA0',
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
                        stage: 'Blackbelly Skatepark',
                        mode: 'Rainmaker',
                        color: {
                            index: 2,
                            title: 'Cool Color',
                            clrA: '#123123',
                            clrB: '#345345',
                            clrNeutral: '#FF00FF',
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
                            clrNeutral: '#FF8563',
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

    it('matches snapshot', () => {
        const settingsStore = createSettingsStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [
                    pinia,
                    [ settingsStore, settingsStoreKey ]
                ]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot with no upcoming round', () => {
        const store = useActiveRoundStore();
        store.activeRound.games = [
            {
                winner: GameWinner.BRAVO,
                stage: 'Blackbelly Skatepark',
                mode: 'Rainmaker',
                color: {
                    index: 2,
                    title: 'Cool Color',
                    clrA: '#123123',
                    clrB: '#345345',
                    clrNeutral: '#00BB00',
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
                    clrNeutral: '#00EE00',
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
                    clrNeutral: '#00FFF0',
                    categoryName: 'Custom Color',
                    isCustom: true,
                    colorsSwapped: true
                }
            },
        ];
        const settingsStore = createSettingsStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [
                    pinia,
                    [ settingsStore, settingsStoreKey ]
                ]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot when editing colors', async () => {
        const settingsStore = createSettingsStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [
                    pinia,
                    [ settingsStore, settingsStoreKey ]
                ]
            }
        });

        wrapper.getComponent('[data-test="edit-colors-toggle"]').vm.$emit('update:modelValue', true);
        await wrapper.vm.$nextTick();

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('handles round reset', () => {
        const store = useActiveRoundStore();
        store.resetActiveRound = jest.fn();
        const settingsStore = createSettingsStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [
                    pinia,
                    [ settingsStore, settingsStoreKey ]
                ]
            }
        });

        wrapper.getComponent('[data-test="reset-button"]').vm.$emit('click');

        expect(store.resetActiveRound).toHaveBeenCalledTimes(1);
    });

    it('handles round update', () => {
        const store = useActiveRoundStore();
        store.updateActiveGames = jest.fn();
        const settingsStore = createSettingsStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [
                    pinia,
                    [ settingsStore, settingsStoreKey ]
                ]
            }
        });

        wrapper.getComponent('[data-test="set-editor-0"] > [data-test="stage-select"]')
            .vm.$emit('update:modelValue', 'Moray Towers');
        wrapper.getComponent('[data-test="update-button"]').vm.$emit('click');

        expect(store.updateActiveGames).toHaveBeenCalledWith([
            {
                color: {
                    categoryName: 'Cool Colors',
                    clrA: '#123123',
                    clrB: '#345345',
                    clrNeutral: '#FF00FF',
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
                    clrNeutral: '#FF8563',
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

    it('reverts changes on update button right click', async () => {
        const settingsStore = createSettingsStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [
                    pinia,
                    [ settingsStore, settingsStoreKey ]
                ]
            }
        });
        const event = new Event(null);
        jest.spyOn(event, 'preventDefault');

        wrapper.getComponent('[data-test="set-editor-0"] > [data-test="stage-select"]')
            .vm.$emit('update:modelValue', 'Moray Towers');
        wrapper.getComponent('[data-test="set-editor-0"] > [data-test="mode-select"]')
            .vm.$emit('update:modelValue', 'Turf War');
        wrapper.getComponent('[data-test="update-button"]').vm.$emit('right-click', event);
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="set-editor-0"] > [data-test="stage-select"]').attributes().modelvalue).toEqual('Blackbelly Skatepark');
        expect(wrapper.getComponent('[data-test="set-editor-0"] > [data-test="mode-select"]').attributes().modelvalue).toEqual('Rainmaker');
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('has expected button color after changing round data', async () => {
        const settingsStore = createSettingsStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [
                    pinia,
                    [ settingsStore, settingsStoreKey ]
                ]
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
        const settingsStore = createSettingsStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [
                    pinia,
                    [ settingsStore, settingsStoreKey ]
                ]
            }
        });

        wrapper.getComponent('[data-test="set-editor-1"] > [data-test="stage-select"]')
            .vm.$emit('update:modelValue', 'Moray Towers');

        expect((wrapper.vm as unknown as { games: ActiveRoundGame[] }).games[1].stage).toEqual('Moray Towers');
    });

    it('handles mode change', () => {
        const settingsStore = createSettingsStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [
                    pinia,
                    [ settingsStore, settingsStoreKey ]
                ]
            }
        });

        wrapper.getComponent('[data-test="set-editor-1"] > [data-test="mode-select"]')
            .vm.$emit('update:modelValue', 'Turf War');

        expect((wrapper.vm as unknown as { games: ActiveRoundGame[] }).games[1].mode).toEqual('Turf War');
    });

    it('handles winner change to none', async () => {
        const store = useActiveRoundStore();
        store.setWinnerForIndex = jest.fn();
        const settingsStore = createSettingsStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [
                    pinia,
                    [ settingsStore, settingsStoreKey ]
                ]
            }
        });

        wrapper.getComponent('[data-test="set-editor-1"] [data-test="set-winner-button-none"]').vm.$emit('click');

        expect(store.setWinnerForIndex)
            .toHaveBeenCalledWith({ index: 1, winner: GameWinner.NO_WINNER });
    });

    it('handles winner change to alpha', async () => {
        const store = useActiveRoundStore();
        store.setWinnerForIndex = jest.fn();
        const settingsStore = createSettingsStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [
                    pinia,
                    [ settingsStore, settingsStoreKey ]
                ]
            }
        });

        wrapper.getComponent('[data-test="set-editor-2"] [data-test="set-winner-button-a"]').vm.$emit('click');

        expect(store.setWinnerForIndex)
            .toHaveBeenCalledWith({ index: 2, winner: GameWinner.ALPHA });
    });

    it('handles winner change to bravo', async () => {
        const store = useActiveRoundStore();
        store.setWinnerForIndex = jest.fn();
        const settingsStore = createSettingsStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [
                    pinia,
                    [ settingsStore, settingsStoreKey ]
                ]
            }
        });

        wrapper.getComponent('[data-test="set-editor-2"] [data-test="set-winner-button-b"]').vm.$emit('click');

        expect(store.setWinnerForIndex)
            .toHaveBeenCalledWith({ index: 2, winner: GameWinner.BRAVO });
    });

    it('handles color change', async () => {
        const settingsStore = createSettingsStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [
                    pinia,
                    [ settingsStore, settingsStoreKey ]
                ]
            }
        });

        wrapper.getComponent('[data-test="set-editor-0"] [data-test="color-select"]')
            .vm.$emit('update:modelValue', 'Ranked Modes_1');

        expect((wrapper.vm as unknown as { games: ActiveRoundGame[] }).games[0].color).toEqual({
            categoryName: 'Ranked Modes',
            clrA: '#04D976',
            clrB: '#D600AB',
            clrNeutral: '#D2E500',
            colorsSwapped: false,
            index: 1,
            isCustom: false,
            title: 'Green vs Magenta'
        });
    });

    it('handles custom color change', async () => {
        const settingsStore = createSettingsStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [
                    pinia,
                    [ settingsStore, settingsStoreKey ]
                ]
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
            clrNeutral: '#FF00FF',
            colorsSwapped: false,
            index: 2,
            isCustom: false,
            title: 'Cool Color'
        });
    });

    it('handles game color being set to custom', async () => {
        const settingsStore = createSettingsStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [
                    pinia,
                    [ settingsStore, settingsStoreKey ]
                ]
            }
        });

        wrapper.getComponent('[data-test="set-editor-0"] [data-test="custom-color-toggle"]')
            .vm.$emit('update:modelValue', true);

        expect((wrapper.vm as unknown as { games: ActiveRoundGame[] }).games[0].color).toEqual({
            categoryName: 'Custom Color',
            clrA: '#123123',
            clrB: '#345345',
            clrNeutral: '#FF00FF',
            colorsSwapped: false,
            index: 0,
            isCustom: true,
            title: 'Custom Color'
        });
    });

    it('handles game color being set off custom', async () => {
        const settingsStore = createSettingsStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [
                    pinia,
                    [ settingsStore, settingsStoreKey ]
                ]
            }
        });

        wrapper.getComponent('[data-test="set-editor-0"] [data-test="custom-color-toggle"]')
            .vm.$emit('update:modelValue', false);

        expect((wrapper.vm as unknown as { games: ActiveRoundGame[] }).games[0].color).toEqual({
            categoryName: 'Custom Color',
            clrA: '#123123',
            clrB: '#345345',
            clrNeutral: '#FF00FF',
            colorsSwapped: false,
            index: 0,
            isCustom: false,
            title: 'Custom Color'
        });
    });

    it('handles game colors getting swapped', async () => {
        const store = useActiveRoundStore();
        store.swapRoundColor = jest.fn();
        const settingsStore = createSettingsStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [
                    pinia,
                    [ settingsStore, settingsStoreKey ]
                ]
            }
        });

        wrapper.getComponent('[data-test="set-editor-0"] [data-test="swap-colors-toggle"]')
            .vm.$emit('update:modelValue', true);

        expect(store.swapRoundColor).toHaveBeenCalledWith({ roundIndex: 0, colorsSwapped: true });
    });

    it('does not revert local changes on store update', async () => {
        const store = useActiveRoundStore();
        const settingsStore = createSettingsStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [
                    pinia,
                    [ settingsStore, settingsStoreKey ]
                ]
            }
        });

        wrapper.getComponent('[data-test="set-editor-0"] > [data-test="stage-select"]')
            .vm.$emit('update:modelValue', 'Camp Triggerfish');
        wrapper.getComponent('[data-test="set-editor-0"] > [data-test="mode-select"]')
            .vm.$emit('update:modelValue', 'Splat Zones');
        wrapper.getComponent('[data-test="set-editor-0"] [data-test="color-select"]')
            .vm.$emit('update:modelValue', 'Ranked Modes_2');
        store.activeRound.games = [
            {
                winner: GameWinner.NO_WINNER,
                stage: 'Blackbelly Skatepark',
                mode: 'Rainmaker',
                color: {
                    index: 2,
                    title: 'Cool Color',
                    clrA: '#123123',
                    clrB: '#345345',
                    clrNeutral: '#FF00FF',
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
                    clrNeutral: '#FF8563',
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
                clrNeutral: '#6912CD',
                categoryName: 'Ranked Modes',
                isCustom: false,
                colorsSwapped: false
            }
        });
    });

    it('matches snapshot when active round updates to one with less games than the previous one', async () => {
        const store = useActiveRoundStore();
        const settingsStore = createSettingsStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [
                    pinia,
                    [ settingsStore, settingsStoreKey ]
                ]
            }
        });

        store.activeRound.games = [
            {
                winner: GameWinner.NO_WINNER,
                stage: 'Blackbelly Skatepark',
                mode: 'Rainmaker',
                color: {
                    index: 2,
                    title: 'Cool Color',
                    clrA: '#123123',
                    clrB: '#345345',
                    clrNeutral: '#00FF00',
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
                    clrNeutral: '#00AA00',
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
        const store = useActiveRoundStore();
        const settingsStore = createSettingsStore();
        const wrapper = mount(SetEditor, {
            global: {
                plugins: [
                    pinia,
                    [ settingsStore, settingsStoreKey ]
                ]
            }
        });

        store.activeRound.games = [
            {
                winner: GameWinner.NO_WINNER,
                stage: 'Blackbelly Skatepark',
                mode: 'Rainmaker',
                color: {
                    index: 2,
                    title: 'Cool Color',
                    clrA: '#123123',
                    clrB: '#345345',
                    clrNeutral: '#00FF00',
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
                    clrNeutral: '#00AA00',
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
