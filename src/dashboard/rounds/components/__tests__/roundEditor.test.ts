import RoundEditor from '../roundEditor.vue';
import { createStore } from 'vuex';
import { TournamentDataStore, tournamentDataStoreKey } from '../../../store/tournamentDataStore';
import { config, flushPromises, mount } from '@vue/test-utils';

describe('RoundEditor', () => {
    config.global.stubs = {
        IplInput: true,
        IplSelect: true,
        IplButton: true
    };

    const mockUpdateRound = jest.fn();
    const mockRemoveRound = jest.fn();

    function createTournamentDataStore() {
        return createStore<TournamentDataStore>({
            state: {
                tournamentData: {
                    meta: { id: '1093478', source: 'SMASHGG' },
                    teams: [
                        { id: '123123', name: 'cool team A', players: [], showLogo: true },
                        { id: '345345', name: 'cool team B', players: [], showLogo: false }
                    ]
                },
                roundStore: {
                    '0387': {
                        meta: { name: 'dope round', isCompleted: false },
                        games: []
                    },
                    '9573': {
                        meta: { name: 'dope round the second', isCompleted: false },
                        games: []
                    },
                    '2426': {
                        meta: { name: 'dope round the third', isCompleted: false },
                        games: []
                    }
                }
            },
            mutations: {
                removeRound: mockRemoveRound
            },
            actions: {
                updateRound: mockUpdateRound
            }
        });
    }

    it('matches snapshot', () => {
        const store = createTournamentDataStore();
        // @ts-ignore: This works.
        const wrapper = mount(RoundEditor, {
            global: {
                plugins: [[store, tournamentDataStoreKey]]
            },
            props: {
                round: {
                    meta: {
                        name: 'Cool Round',
                        isCompleted: false
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
        const store = createTournamentDataStore();
        // @ts-ignore: This works.
        const wrapper = mount(RoundEditor, {
            global: {
                plugins: [[store, tournamentDataStoreKey]]
            },
            props: {
                round: {
                    meta: {
                        name: 'New Round',
                        isCompleted: false
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
        mockUpdateRound.mockResolvedValue({});
        const store = createTournamentDataStore();
        // @ts-ignore: This works.
        const wrapper = mount(RoundEditor, {
            global: {
                plugins: [[store, tournamentDataStoreKey]]
            },
            props: {
                round: {
                    meta: {
                        name: 'New Round',
                        isCompleted: false
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

        expect(mockUpdateRound).toHaveBeenCalledWith(expect.any(Object), {
            id: 'round-456',
            roundName: 'New Round',
            games: [
                { stage: 'Blackbelly Skatepark', mode: 'Splat Zones' },
                { stage: 'Moray Towers', mode: 'Clam Blitz' },
                { stage: 'Port Mackerel', mode: 'Tower Control' }
            ]
        });
        expect(wrapper.emitted('createNewRound')).toBeFalsy();
    });

    it('updates round on update button click if round is new', async () => {
        mockUpdateRound.mockResolvedValue({ id: 'new-round-id' });
        const store = createTournamentDataStore();
        // @ts-ignore: This works.
        const wrapper = mount(RoundEditor, {
            global: {
                plugins: [[store, tournamentDataStoreKey]]
            },
            props: {
                round: {
                    meta: {
                        name: 'New Round',
                        isCompleted: false
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

        expect(mockUpdateRound).toHaveBeenCalledWith(expect.any(Object), {
            roundName: 'New Round',
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
        const store = createTournamentDataStore();
        // @ts-ignore: This works.
        const wrapper = mount(RoundEditor, {
            global: {
                plugins: [[store, tournamentDataStoreKey]]
            },
            props: {
                round: {
                    meta: {
                        name: 'New Round',
                        isCompleted: false
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

        expect(mockRemoveRound).toHaveBeenCalledWith(expect.any(Object), {
            roundId: 'round-456'
        });
    });

    it('cancels new round creation on remove button click when round is new', async () => {
        const store = createTournamentDataStore();
        // @ts-ignore: This works.
        const wrapper = mount(RoundEditor, {
            global: {
                plugins: [[store, tournamentDataStoreKey]]
            },
            props: {
                round: {
                    meta: {
                        name: 'New Round',
                        isCompleted: false
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

        expect(mockRemoveRound).not.toHaveBeenCalled();
        expect(wrapper.emitted('cancelNewRound').length).toEqual(1);
    });

    it('changes button color when data is changed and round is already saved', async () => {
        const store = createTournamentDataStore();
        // @ts-ignore: This works.
        const wrapper = mount(RoundEditor, {
            global: {
                plugins: [[store, tournamentDataStoreKey]]
            },
            props: {
                round: {
                    meta: {
                        name: 'New Round',
                        isCompleted: false
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
