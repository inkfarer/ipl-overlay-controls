import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import difference from 'lodash/difference';
import { config, mount } from '@vue/test-utils';
import HighlightedMatchPicker from '../highlightedMatchPicker.vue';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { useHighlightedMatchStore } from '../../highlightedMatchStore';

describe('HighlightedMatchPicker', () => {
    let pinia: TestingPinia;

    config.global.stubs = {
        HighlightedMatchImporter: true,
        HighlightedMatchViewer: true,
        FontAwesomeIcon: true
    };

    beforeEach(() => {
        pinia = createTestingPinia();

        useHighlightedMatchStore().$state = {
            tournamentData: null,
            highlightedMatches: null
        };
    });

    const importableSources = [
        TournamentDataSource.SMASHGG,
        TournamentDataSource.BATTLEFY
    ];

    difference(Object.values(TournamentDataSource), importableSources).forEach(source => {
        it(`displays warning for source ${source}`, () => {
            const store = useHighlightedMatchStore();
            store.tournamentData = {
                meta: {
                    source,
                    id: 'tournament123',
                    shortName: null
                },
                teams: []
            };
            const wrapper = mount(HighlightedMatchPicker, {
                global: {
                    plugins: [pinia]
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
            const store = useHighlightedMatchStore();
            store.tournamentData = {
                meta: {
                    source,
                    id: 'tournament123',
                    shortName: null
                },
                teams: [],
                stages: [{ name: 'Cool Stage', id: '123123', type: 'SWISS' }]
            };
            const wrapper = mount(HighlightedMatchPicker, {
                global: {
                    plugins: [pinia]
                }
            });

            expect(wrapper.findComponent('[data-test="unsupported-source-warning"]').exists()).toEqual(false);
            expect(wrapper.findComponent('[data-test="missing-stages-message"]').exists()).toEqual(false);
            expect(wrapper.findComponent('highlighted-match-importer-stub').isVisible()).toEqual(true);
            expect(wrapper.findComponent('highlighted-match-viewer-stub').isVisible()).toEqual(true);
        });

        it(`displays warning when stages are not present for ${source}`, () => {
            const store = useHighlightedMatchStore();
            store.tournamentData = {
                meta: {
                    source,
                    id: 'tournament123',
                    shortName: null
                },
                teams: [],
                stages: undefined
            };
            const wrapper = mount(HighlightedMatchPicker, {
                global: {
                    plugins: [pinia]
                }
            });

            expect(wrapper.findComponent('[data-test="unsupported-source-warning"]').exists()).toEqual(false);
            expect(wrapper.findComponent('[data-test="missing-stages-message"]').exists()).toEqual(true);
            expect(wrapper.findComponent('highlighted-match-importer-stub').exists()).toEqual(false);
            expect(wrapper.findComponent('highlighted-match-viewer-stub').exists()).toEqual(false);
        });
    });
});
