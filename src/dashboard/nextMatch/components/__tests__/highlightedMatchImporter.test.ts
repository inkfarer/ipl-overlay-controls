import HighlightedMatchImporter from '../highlightedMatchImporter.vue';
import { config, mount } from '@vue/test-utils';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import { BracketType } from 'types/enums/bracketType';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { useHighlightedMatchStore } from '../../highlightedMatchStore';
import { IplButton, IplSelect } from '@iplsplatoon/vue-components';

describe('HighlightedMatchImporter', () => {
    let pinia: TestingPinia;

    config.global.stubs = {
        IplMultiSelect: true,
        IplButton: true
    };

    beforeEach(() => {
        pinia = createTestingPinia();

        useHighlightedMatchStore().$state = {
            tournamentData: {
                meta: {
                    id: 'tournament123',
                    source: TournamentDataSource.UNKNOWN,
                    shortName: 'Unknown Tournament'
                },
                teams: []
            },
            highlightedMatches: null
        };
    });

    it('has expected match selector label and options when tournament is imported from battlefy', () => {
        const store = useHighlightedMatchStore();
        store.tournamentData = {
            meta: {
                id: 'tournament123',
                source: TournamentDataSource.BATTLEFY,
                shortName: null
            },
            teams: [],
            stages: [
                { type: BracketType.LADDER, id: 'ladder123', name: 'Ladder' },
                { type: BracketType.SWISS, id: 'swis12', name: 'Swiss' },
                { type: BracketType.DOUBLE_ELIMINATION, id: 'de123', name: 'DE' },
                { type: BracketType.SINGLE_ELIMINATION, id: 'se1345', name: 'SE' },
                { type: BracketType.ROUND_ROBIN, id: 'rr1235543', name: 'RR' }
            ]
        };
        const wrapper = mount(HighlightedMatchImporter, {
            global: {
                plugins: [pinia]
            }
        });

        const selector = wrapper.getComponent<typeof IplSelect>('[data-test="match-selector"]');
        expect(selector.attributes().label).toEqual('Bracket');
        expect((selector.vm.$props as { options: unknown }).options).toEqual([
            { value: 'swis12', name: 'Swiss' },
            { value: 'de123', name: 'DE' },
            { value: 'se1345', name: 'SE' },
            { value: 'rr1235543', name: 'RR' },
            { value: 'all', name: 'All Brackets' }
        ]);
    });

    it('has expected match selector label and options when tournament is imported from smash.gg', () => {
        const store = useHighlightedMatchStore();
        store.tournamentData = {
            meta: {
                id: 'tournament123',
                source: TournamentDataSource.SMASHGG,
                shortName: null,
                sourceSpecificData: {
                    smashgg: {
                        streams: [
                            { id: 123098, streamName: 'Cool Stream' },
                            { id: 5609823, streamName: 'Cooler Stream' }
                        ],
                        tournamentId: 243087,
                        eventData: null
                    }
                }
            },
            teams: []
        };
        const wrapper = mount(HighlightedMatchImporter, {
            global: {
                plugins: [pinia]
            }
        });

        const selector = wrapper.getComponent<typeof IplSelect>('[data-test="match-selector"]');
        expect(selector.attributes().label).toEqual('Stream');
        expect((selector.vm.$props as { options: unknown }).options).toEqual([
            { value: '123098', name: 'Cool Stream' },
            { value: '5609823', name: 'Cooler Stream' },
            { value: 'all', name: 'All Streams' }
        ]);
    });

    it('dispatches to store when importing', async () => {
        const store = useHighlightedMatchStore();
        store.getHighlightedMatches = jest.fn();
        const wrapper = mount(HighlightedMatchImporter, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplSelect>('[data-test="match-selector"]').vm.$emit('update:modelValue', [{ foo: 'bar' }]);
        await wrapper.vm.$nextTick();
        wrapper.getComponent<typeof IplButton>('[data-test="import-button"]').vm.$emit('click');

        expect(store.getHighlightedMatches).toHaveBeenCalledWith({ options: [{ foo: 'bar' }]});
    });

    it('disables import button when nothing is selected', async () => {
        const wrapper = mount(HighlightedMatchImporter, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplSelect>('[data-test="match-selector"]').vm.$emit('update:modelValue', []);
        await wrapper.vm.$nextTick();
        expect(wrapper.getComponent('[data-test="import-button"]').attributes().disabled).toEqual('true');

        wrapper.getComponent<typeof IplSelect>('[data-test="match-selector"]').vm.$emit('update:modelValue', [{ foo: 'bar' }]);
        await wrapper.vm.$nextTick();
        expect(wrapper.getComponent('[data-test="import-button"]').attributes().disabled).toEqual('false');
    });
});
