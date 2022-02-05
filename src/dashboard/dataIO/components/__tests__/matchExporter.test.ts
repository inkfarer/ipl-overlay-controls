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
                        games: []
                    },
                    bbb: {
                        meta: {
                            name: 'Round Two',
                            isCompleted: false
                        },
                        teamA: {
                            score: 0,
                            id: '888',
                            name: 'Team Three',
                            showLogo: true,
                            players: null,
                            color: null
                        },
                        teamB: {
                            score: 2,
                            id: '999',
                            name: 'Team Four',
                            showLogo: false,
                            players: null,
                            color: null
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
                teamA: {
                    score: 0,
                    id: '888',
                    name: 'Team Three',
                    showLogo: true,
                    players: null,
                    color: null
                },
                teamB: {
                    score: 2,
                    id: '999',
                    name: 'Team Four',
                    showLogo: false,
                    players: null,
                    color: null
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
