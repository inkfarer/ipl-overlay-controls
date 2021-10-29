import TeamDataImporter from '../teamDataImporter.vue';
import { createStore } from 'vuex';
import { TournamentDataStore, tournamentDataStoreKey } from '../../../store/tournamentDataStore';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import { config, flushPromises, mount } from '@vue/test-utils';
import { mockBundleConfig } from '../../../__mocks__/mockNodecg';

describe('teamDataImporter', () => {
    config.global.stubs = {
        IplButton: true,
        IplSelect: true,
        IplInput: true
    };

    const mockGetSmashggEvent = jest.fn();
    const mockGetTournamentData = jest.fn();

    function createTournamentDataStore() {
        return createStore<TournamentDataStore>({
            state: {
                tournamentData: {
                    meta: {
                        id: '123123',
                        source: TournamentDataSource.BATTLEFY
                    },
                    teams: []
                },
                roundStore: {}
            },
            actions: {
                getSmashggEvent: mockGetSmashggEvent,
                getTournamentData: mockGetTournamentData
            }
        });
    }

    it('displays data of existing tournament', () => {
        const store = createTournamentDataStore();
        store.state.tournamentData.meta = {
            source: TournamentDataSource.BATTLEFY,
            id: '123123asd',
            name: 'Cool Tournament',
            url: 'tournament://cool-tournament'
        };
        const wrapper = mount(TeamDataImporter, {
            global: {
                plugins: [[ store, tournamentDataStoreKey ]]
            }
        });

        expect(wrapper.get('.existing-data').html()).toMatchSnapshot();
    });

    it('displays data of existing tournament if it is missing a name', () => {
        const store = createTournamentDataStore();
        store.state.tournamentData.meta = {
            source: TournamentDataSource.BATTLEFY,
            id: '123123asd',
            url: 'tounament://cool-tournament'
        };
        const wrapper = mount(TeamDataImporter, {
            global: {
                plugins: [[ store, tournamentDataStoreKey ]]
            }
        });

        expect(wrapper.get('.existing-data').html()).toMatchSnapshot();
    });

    it('displays data of existing tournament if it is missing an URL', () => {
        const store = createTournamentDataStore();
        store.state.tournamentData.meta = {
            source: TournamentDataSource.BATTLEFY,
            id: '123123asd',
            name: 'cool tournament'
        };
        const wrapper = mount(TeamDataImporter, {
            global: {
                plugins: [[ store, tournamentDataStoreKey ]]
            }
        });

        expect(wrapper.get('.existing-data').html()).toMatchSnapshot();
    });

    it('displays data of existing tournament if it has smash.gg data', () => {
        const store = createTournamentDataStore();
        store.state.tournamentData.meta = {
            source: TournamentDataSource.SMASHGG,
            id: '123123asd',
            name: 'cool tournament',
            url: 'smashgg://cool-tournament',
            sourceSpecificData: {
                smashgg: {
                    tournamentId: 1234,
                    eventData: {
                        id: 1234,
                        name: 'Cool Event',
                        game: 'Splatoon 2'
                    }
                }
            }
        };
        const wrapper = mount(TeamDataImporter, {
            global: {
                plugins: [[ store, tournamentDataStoreKey ]]
            }
        });

        expect(wrapper.get('.existing-data').html()).toMatchSnapshot();
    });

    it('has expected data source options if smash.gg config is present', () => {
        mockBundleConfig.smashgg = { apiKey: 'ggkey123' };
        const store = createTournamentDataStore();
        const wrapper = mount(TeamDataImporter, {
            global: {
                plugins: [[ store, tournamentDataStoreKey ]]
            }
        });
        const sourceSelector = wrapper.getComponent('[data-test="source-selector"]');

        expect((sourceSelector.vm.$props as { options: unknown }).options).toEqual([
            { name: 'Battlefy', value: TournamentDataSource.BATTLEFY },
            { name: 'Smash.gg', value: TournamentDataSource.SMASHGG },
            { name: 'Uploaded file', value: TournamentDataSource.UPLOAD }
        ]);
    });

    it('has expected data source options if smash.gg config is not present', () => {
        mockBundleConfig.smashgg = undefined;
        const store = createTournamentDataStore();
        const wrapper = mount(TeamDataImporter, {
            global: {
                plugins: [[ store, tournamentDataStoreKey ]]
            }
        });
        const sourceSelector = wrapper.getComponent('[data-test="source-selector"]');

        expect((sourceSelector.vm.$props as { options: unknown }).options).toEqual([
            { name: 'Battlefy', value: TournamentDataSource.BATTLEFY },
            { name: 'Uploaded file', value: TournamentDataSource.UPLOAD }
        ]);
    });

    it('dispatches to store on import', () => {
        const store = createTournamentDataStore();
        const wrapper = mount(TeamDataImporter, {
            global: {
                plugins: [[ store, tournamentDataStoreKey ]]
            }
        });

        wrapper.getComponent('[data-test="source-selector"]').vm.$emit('update:modelValue', 'SMASHGG');
        wrapper.getComponent('[name="tournament-id-input"]').vm.$emit('update:modelValue', 'cool-tourney');
        wrapper.getComponent('[data-test="import-button"]').vm.$emit('click');

        expect(mockGetTournamentData).toHaveBeenCalledWith(expect.any(Object), {
            method: TournamentDataSource.SMASHGG,
            id: 'cool-tourney'
        });
    });

    it('shows smash.gg event selector if import returns more than one event', async () => {
        mockGetTournamentData.mockResolvedValue({
            events: [
                { id: 123123, name: 'Event One', game: 'Splatoon 2' },
                { id: 456456, name: 'Event Two', game: 'Ultimate' }
            ]
        });
        const store = createTournamentDataStore();
        const wrapper = mount(TeamDataImporter, {
            global: {
                plugins: [[ store, tournamentDataStoreKey ]]
            }
        });

        wrapper.getComponent('[data-test="import-button"]').vm.$emit('click');
        await flushPromises();

        expect(wrapper.findComponent('[data-test="smashgg-event-selector"]').exists()).toEqual(true);
        expect(wrapper.findComponent('[data-test="smashgg-event-import-button"]').exists()).toEqual(true);
        expect(wrapper.findComponent('[data-test="smashgg-event-import-cancel-button"]').exists()).toEqual(true);
        expect(wrapper.findComponent('[data-test="import-button"]').exists()).toEqual(false);
    });

    it('dispatches to store on smash.gg event import', async () => {
        mockGetTournamentData.mockResolvedValue({
            events: [
                { id: 123123, name: 'Event One', game: 'Splatoon 2' },
                { id: 456456, name: 'Event Two', game: 'Ultimate' }
            ]
        });
        mockGetSmashggEvent.mockResolvedValue({});
        const store = createTournamentDataStore();
        const wrapper = mount(TeamDataImporter, {
            global: {
                plugins: [[ store, tournamentDataStoreKey ]]
            }
        });

        wrapper.getComponent('[data-test="import-button"]').vm.$emit('click');
        await flushPromises();
        wrapper.getComponent('[data-test="smashgg-event-selector"]').vm.$emit('update:modelValue', '456456');
        wrapper.getComponent('[data-test="smashgg-event-import-button"]').vm.$emit('click');
        await flushPromises();

        expect(mockGetSmashggEvent).toHaveBeenCalledWith(expect.any(Object), { eventId: 456456 });
        expect(wrapper.findComponent('[data-test="import-button"]').exists()).toEqual(true);
    });

    it('handles smash.gg event import being cancelled', async () => {
        mockGetTournamentData.mockResolvedValue({
            events: [
                { id: 123123, name: 'Event One', game: 'Splatoon 2' },
                { id: 456456, name: 'Event Two', game: 'Ultimate' }
            ]
        });
        const store = createTournamentDataStore();
        const wrapper = mount(TeamDataImporter, {
            global: {
                plugins: [[ store, tournamentDataStoreKey ]]
            }
        });

        wrapper.getComponent('[data-test="import-button"]').vm.$emit('click');
        await flushPromises();
        wrapper.getComponent('[data-test="smashgg-event-import-cancel-button"]').vm.$emit('click');
        await wrapper.vm.$nextTick();

        expect(mockGetSmashggEvent).not.toHaveBeenCalled();
        expect(wrapper.findComponent('[data-test="import-button"]').exists()).toEqual(true);
    });
});
