import HighlightedMatches from '../highlightedMatches.vue';
import { createStore } from 'vuex';
import { HighlightedMatchStore, highlightedMatchStoreKey } from '../highlightedMatchStore';
import difference from 'lodash/difference';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import { config, mount } from '@vue/test-utils';

describe('HighlightedMatches', () => {
    config.global.stubs = {
        HighlightedMatchImporter: true,
        HighlightedMatchViewer: true,
        IplErrorDisplay: true
    };

    function createHighlightedMatchStore() {
        return createStore<HighlightedMatchStore>({
            state: {
                tournamentData: null,
                highlightedMatches: null
            }
        });
    }

    const importableSources = [
        TournamentDataSource.SMASHGG,
        TournamentDataSource.BATTLEFY
    ];

    difference(Object.values(TournamentDataSource), importableSources).forEach(source => {
        it(`displays warning for source ${source}`, () => {
            const store = createHighlightedMatchStore();
            store.state.tournamentData = {
                meta: {
                    source,
                    id: 'tournament123'
                },
                teams: []
            };
            const wrapper = mount(HighlightedMatches, {
                global: {
                    plugins: [[store, highlightedMatchStoreKey]]
                }
            });

            expect(wrapper.findComponent('[data-test="unsupported-source-warning"]').isVisible()).toEqual(true);
            expect(wrapper.findComponent('[data-test="unsupported-source-warning"]').text()).toMatchSnapshot();
            expect(wrapper.findComponent('highlighted-match-importer-stub').exists()).toEqual(false);
            expect(wrapper.findComponent('highlighted-match-viewer-stub').exists()).toEqual(false);
        });
    });

    importableSources.forEach(source => {
        it(`displays importer and viewer for source ${source}`, () => {
            const store = createHighlightedMatchStore();
            store.state.tournamentData = {
                meta: {
                    source,
                    id: 'tournament123'
                },
                teams: [],
                stages: [{ name: 'Cool Stage', id: '123123', type: 'SWISS' }]
            };
            const wrapper = mount(HighlightedMatches, {
                global: {
                    plugins: [[store, highlightedMatchStoreKey]]
                }
            });

            expect(wrapper.findComponent('[data-test="unsupported-source-warning"]').exists()).toEqual(false);
            expect(wrapper.findComponent('[data-test="missing-stages-message"]').exists()).toEqual(false);
            expect(wrapper.findComponent('highlighted-match-importer-stub').isVisible()).toEqual(true);
            expect(wrapper.findComponent('highlighted-match-viewer-stub').isVisible()).toEqual(true);
        });

        it(`displays warning when stages are not present for ${source}`, () => {
            const store = createHighlightedMatchStore();
            store.state.tournamentData = {
                meta: {
                    source,
                    id: 'tournament123'
                },
                teams: [],
                stages: undefined
            };
            const wrapper = mount(HighlightedMatches, {
                global: {
                    plugins: [[store, highlightedMatchStoreKey]]
                }
            });

            expect(wrapper.findComponent('[data-test="unsupported-source-warning"]').exists()).toEqual(false);
            expect(wrapper.findComponent('[data-test="missing-stages-message"]').exists()).toEqual(true);
            expect(wrapper.findComponent('highlighted-match-importer-stub').exists()).toEqual(false);
            expect(wrapper.findComponent('highlighted-match-viewer-stub').exists()).toEqual(false);
        });
    });
});
