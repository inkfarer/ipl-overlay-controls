import { createStore } from 'vuex';
import { TournamentDataStore, tournamentDataStoreKey } from '../../../store/tournamentDataStore';
import { config, mount } from '@vue/test-utils';
import MatchExporter from '../matchExporter.vue';

describe('MatchExporter', () => {
    config.global.stubs = {
        IplButton: true
    };

    function createTournamentDataStore() {
        return createStore<TournamentDataStore>({
            state: {
                tournamentData: null,
                roundStore: null,
                matchStore: {
                    aaa: {
                        meta: {
                            name: 'Round One',
                            isCompleted: false
                        },
                        games: []
                    },
                    bbb: {
                        meta: {
                            name: 'Round Two',
                            isCompleted: false
                        },
                        games: []
                    }
                }
            }
        });
    }

    it('matches snapshot', () => {
        const store = createTournamentDataStore();
        const wrapper = mount(MatchExporter, {
            global: {
                plugins: [[store, tournamentDataStoreKey]]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot with one match', () => {
        const store = createTournamentDataStore();
        store.state.matchStore = {
            ccc: {
                meta: {
                    name: 'Round Three',
                    isCompleted: false
                },
                games: []
            }
        };
        const wrapper = mount(MatchExporter, {
            global: {
                plugins: [[store, tournamentDataStoreKey]]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });
});
