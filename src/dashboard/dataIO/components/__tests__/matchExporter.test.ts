import { config, mount } from '@vue/test-utils';
import MatchExporter from '../matchExporter.vue';
import { PlayType } from 'types/enums/playType';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { useTournamentDataStore } from '../../../store/tournamentDataStore';

describe('MatchExporter', () => {
    let pinia: TestingPinia;

    config.global.stubs = {
        IplButton: true
    };

    beforeEach(() => {
        pinia = createTestingPinia();

        useTournamentDataStore().$state = {
            tournamentData: null,
            roundStore: null,
            matchStore: {
                aaa: {
                    meta: {
                        name: 'Round One',
                        isCompleted: false,
                        type: PlayType.BEST_OF
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
                        isCompleted: false,
                        type: PlayType.PLAY_ALL
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
        };
    });

    it('matches snapshot', () => {
        const wrapper = mount(MatchExporter, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot with one match', () => {
        const store = useTournamentDataStore();
        store.matchStore = {
            ccc: {
                meta: {
                    name: 'Round Three',
                    isCompleted: false,
                    type: PlayType.BEST_OF
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
                plugins: [pinia]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });
});
