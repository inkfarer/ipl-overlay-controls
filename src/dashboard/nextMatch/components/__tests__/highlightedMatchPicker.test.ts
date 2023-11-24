import { TournamentDataSource } from 'types/enums/tournamentDataSource';
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

    it('displays importer when smash.gg streams are present', () => {
        const store = useHighlightedMatchStore();
        store.tournamentData = {
            meta: {
                source: TournamentDataSource.SMASHGG,
                id: 'tournament123',
                shortName: null,
                sourceSpecificData: {
                    // @ts-ignore
                    smashgg: {
                        streams: [{ id: 99999, streamName: 'iplsplatoon' }]
                    }
                }
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
        expect(wrapper.findComponent('[data-test="missing-stages-message"]').exists()).toEqual(false);
        expect(wrapper.findComponent('highlighted-match-importer-stub').isVisible()).toEqual(true);
        expect(wrapper.findComponent('highlighted-match-viewer-stub').isVisible()).toEqual(true);
    });

    it('displays warning when smash.gg streams are not present', () => {
        const store = useHighlightedMatchStore();
        store.tournamentData = {
            meta: {
                source: TournamentDataSource.SMASHGG,
                id: 'tournament123',
                shortName: null,
                sourceSpecificData: {
                    // @ts-ignore
                    smashgg: {
                        streams: []
                    }
                }
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

    it('displays importer for battlefy stages', () => {
        const store = useHighlightedMatchStore();
        store.tournamentData = {
            meta: {
                source: TournamentDataSource.BATTLEFY,
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

    it('displays warning when battlefy stages are not present', () => {
        const store = useHighlightedMatchStore();
        store.tournamentData = {
            meta: {
                source: TournamentDataSource.BATTLEFY,
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
