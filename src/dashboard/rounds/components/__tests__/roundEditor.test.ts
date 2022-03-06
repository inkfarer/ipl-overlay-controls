import RoundEditor from '../roundEditor.vue';
import { createStore } from 'vuex';
import { config, flushPromises, mount } from '@vue/test-utils';
import { PlayType } from 'types/enums/playType';
import { GameVersion } from 'types/enums/gameVersion';
import { settingsStoreKey } from '../../../settings/settingsStore';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { useTournamentDataStore } from '../../../store/tournamentDataStore';

describe('RoundEditor', () => {
    let pinia: TestingPinia;

    config.global.stubs = {
        IplInput: true,
        IplSelect: true,
        IplButton: true
    };

    beforeEach(() => {
        pinia = createTestingPinia();

        useTournamentDataStore().$state = {
            tournamentData: {
                meta: { id: '1093478', source: 'SMASHGG', shortName: null },
                teams: [
                    { id: '123123', name: 'cool team A', players: [], showLogo: true },
                    { id: '345345', name: 'cool team B', players: [], showLogo: false }
                ]
            },
            roundStore: {
                '0387': {
                    meta: { name: 'dope round', type: PlayType.BEST_OF },
                    games: []
                },
                '9573': {
                    meta: { name: 'dope round the second', type: PlayType.BEST_OF },
                    games: []
                },
                '2426': {
                    meta: { name: 'dope round the third', type: PlayType.BEST_OF },
                    games: []
                }
            },
            matchStore: {}
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
        // @ts-ignore: This works.
        const wrapper = mount(RoundEditor, {
            global: {
                plugins: [
                    pinia,
                    [settingsStore, settingsStoreKey]
                ]
            },
            props: {
                round: {
                    meta: {
                        name: 'Cool Round',
                        isCompleted: false,
                        type: PlayType.PLAY_ALL
                    },
                    games: [
                        { stage: 'Blackbelly Skatepark', mode: 'Rainmaker' },
                        { stage: 'Moray Towers', mode: 'Clam Blitz' },
                        { stage: 'Port Mackerel', mode: 'Tower Control' }
                    ]
                },
                roundId: 'round-123',
                isNewRound: false
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot when creating new round', () => {
        const settingsStore = createSettingsStore();
        // @ts-ignore: This works.
        const wrapper = mount(RoundEditor, {
            global: {
                plugins: [
                    pinia,
                    [settingsStore, settingsStoreKey]
                ]
            },
            props: {
                round: {
                    meta: {
                        name: 'New Round',
                        isCompleted: false,
                        type: PlayType.BEST_OF
                    },
                    games: [
                        { stage: 'Blackbelly Skatepark', mode: 'Rainmaker' },
                        { stage: 'Moray Towers', mode: 'Clam Blitz' },
                        { stage: 'Port Mackerel', mode: 'Tower Control' },
                        { stage: 'MakoMart', mode: 'Splat Zones' },
                        { stage: 'Ancho-V Games', mode: 'Tower Control' }
                    ]
                },
                roundId: 'round-456',
                isNewRound: true
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('updates round on update button click', async () => {
        const store = useTournamentDataStore();
        store.updateRound = jest.fn().mockResolvedValue({});
        const settingsStore = createSettingsStore();
        // @ts-ignore: This works.
        const wrapper = mount(RoundEditor, {
            global: {
                plugins: [
                    pinia,
                    [settingsStore, settingsStoreKey]
                ]
            },
            props: {
                round: {
                    meta: {
                        name: 'New Round',
                        isCompleted: false,
                        type: PlayType.PLAY_ALL
                    },
                    games: [
                        { stage: 'Blackbelly Skatepark', mode: 'Rainmaker' },
                        { stage: 'Moray Towers', mode: 'Clam Blitz' },
                        { stage: 'Port Mackerel', mode: 'Tower Control' }
                    ]
                },
                roundId: 'round-456',
                isNewRound: false
            }
        });

        wrapper.getComponent('[data-test="mode-selector-0"]').vm.$emit('update:modelValue', 'Splat Zones');
        wrapper.getComponent('[data-test="update-button"]').vm.$emit('click');
        await flushPromises();

        expect(store.updateRound).toHaveBeenCalledWith({
            id: 'round-456',
            roundName: 'New Round',
            type: PlayType.PLAY_ALL,
            games: [
                { stage: 'Blackbelly Skatepark', mode: 'Splat Zones' },
                { stage: 'Moray Towers', mode: 'Clam Blitz' },
                { stage: 'Port Mackerel', mode: 'Tower Control' }
            ]
        });
        expect(wrapper.emitted('createNewRound')).toBeFalsy();
    });

    it('reverts changes on update button right click', async () => {
        const settingsStore = createSettingsStore();
        // @ts-ignore: This works.
        const wrapper = mount(RoundEditor, {
            global: {
                plugins: [
                    pinia,
                    [settingsStore, settingsStoreKey]
                ]
            },
            props: {
                round: {
                    meta: {
                        name: 'New Round',
                        isCompleted: false,
                        type: PlayType.PLAY_ALL
                    },
                    games: [
                        { stage: 'Blackbelly Skatepark', mode: 'Rainmaker' },
                        { stage: 'Moray Towers', mode: 'Clam Blitz' },
                        { stage: 'Port Mackerel', mode: 'Tower Control' }
                    ]
                },
                roundId: 'round-456',
                isNewRound: false
            }
        });
        const event = new Event(null);
        jest.spyOn(event, 'preventDefault');

        wrapper.getComponent('[data-test="mode-selector-0"]').vm.$emit('update:modelValue', 'Splat Zones');
        wrapper.getComponent('[name="round-name"]').vm.$emit('update:modelValue', 'Cool Round');
        wrapper.getComponent('[name="round-type"]').vm.$emit('update:modelValue', PlayType.BEST_OF);
        wrapper.getComponent('[data-test="update-button"]').vm.$emit('right-click', event);
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="mode-selector-0"]').attributes().modelvalue).toEqual('Rainmaker');
        expect(wrapper.getComponent('[name="round-name"]').attributes().modelvalue).toEqual('New Round');
        expect(wrapper.getComponent('[name="round-type"]').attributes().modelvalue).toEqual(PlayType.PLAY_ALL);
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('updates round on update button click if round is new', async () => {
        const store = useTournamentDataStore();
        store.insertRound = jest.fn().mockResolvedValue({ id: 'new-round-id' });
        const settingsStore = createSettingsStore();
        // @ts-ignore: This works.
        const wrapper = mount(RoundEditor, {
            global: {
                plugins: [
                    pinia,
                    [settingsStore, settingsStoreKey]
                ]
            },
            props: {
                round: {
                    meta: {
                        name: 'New Round',
                        isCompleted: false,
                        type: PlayType.PLAY_ALL
                    },
                    games: [
                        { stage: 'Blackbelly Skatepark', mode: 'Rainmaker' },
                        { stage: 'Moray Towers', mode: 'Clam Blitz' },
                        { stage: 'Port Mackerel', mode: 'Tower Control' }
                    ]
                },
                roundId: 'round-456',
                isNewRound: true
            }
        });

        wrapper.getComponent('[data-test="mode-selector-0"]').vm.$emit('update:modelValue', 'Splat Zones');
        wrapper.getComponent('[data-test="update-button"]').vm.$emit('click');
        await flushPromises();

        expect(store.insertRound).toHaveBeenCalledWith({
            roundName: 'New Round',
            type: PlayType.PLAY_ALL,
            games: [
                { stage: 'Blackbelly Skatepark', mode: 'Splat Zones' },
                { stage: 'Moray Towers', mode: 'Clam Blitz' },
                { stage: 'Port Mackerel', mode: 'Tower Control' }
            ]
        });
        const newRoundEmits = wrapper.emitted('createNewRound');
        expect(newRoundEmits.length).toEqual(1);
        expect(newRoundEmits[0]).toEqual(['new-round-id']);
    });

    it('removes round on remove button click', async () => {
        const store = useTournamentDataStore();
        store.removeRound = jest.fn();
        const settingsStore = createSettingsStore();
        // @ts-ignore: This works.
        const wrapper = mount(RoundEditor, {
            global: {
                plugins: [
                    pinia,
                    [settingsStore, settingsStoreKey]
                ]
            },
            props: {
                round: {
                    meta: {
                        name: 'New Round',
                        isCompleted: false,
                        type: PlayType.PLAY_ALL
                    },
                    games: [
                        { stage: 'Blackbelly Skatepark', mode: 'Rainmaker' },
                        { stage: 'Moray Towers', mode: 'Clam Blitz' },
                        { stage: 'Port Mackerel', mode: 'Tower Control' }
                    ]
                },
                roundId: 'round-456',
                isNewRound: false
            }
        });

        wrapper.getComponent('[data-test="remove-button"]').vm.$emit('click');

        expect(store.removeRound).toHaveBeenCalledWith({ roundId: 'round-456' });
    });

    it('cancels new round creation on remove button click when round is new', async () => {
        const store = useTournamentDataStore();
        store.removeRound = jest.fn();
        const settingsStore = createSettingsStore();
        // @ts-ignore: This works.
        const wrapper = mount(RoundEditor, {
            global: {
                plugins: [
                    pinia,
                    [settingsStore, settingsStoreKey]
                ]
            },
            props: {
                round: {
                    meta: {
                        name: 'New Round',
                        isCompleted: false,
                        type: PlayType.PLAY_ALL
                    },
                    games: [
                        { stage: 'Blackbelly Skatepark', mode: 'Rainmaker' },
                        { stage: 'Moray Towers', mode: 'Clam Blitz' },
                        { stage: 'Port Mackerel', mode: 'Tower Control' }
                    ]
                },
                roundId: 'round-456',
                isNewRound: true
            }
        });

        wrapper.getComponent('[data-test="remove-button"]').vm.$emit('click');

        expect(store.removeRound).not.toHaveBeenCalled();
        expect(wrapper.emitted('cancelNewRound').length).toEqual(1);
    });

    it('changes button color when data is changed and round is already saved', async () => {
        const settingsStore = createSettingsStore();
        // @ts-ignore: This works.
        const wrapper = mount(RoundEditor, {
            global: {
                plugins: [
                    pinia,
                    [settingsStore, settingsStoreKey]
                ]
            },
            props: {
                round: {
                    meta: {
                        name: 'New Round',
                        isCompleted: false,
                        type: PlayType.PLAY_ALL
                    },
                    games: [
                        { stage: 'Blackbelly Skatepark', mode: 'Rainmaker' },
                        { stage: 'Moray Towers', mode: 'Clam Blitz' },
                        { stage: 'Port Mackerel', mode: 'Tower Control' }
                    ]
                },
                roundId: 'round-456',
                isNewRound: false
            }
        });

        wrapper.getComponent('[data-test="mode-selector-0"]').vm.$emit('update:modelValue', 'Splat Zones');
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="update-button"]').props().color).toEqual('red');
    });
});
