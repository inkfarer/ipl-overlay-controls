import HighlightedMatchImporter from '../highlightedMatchImporter.vue';
import { createStore } from 'vuex';
import { HighlightedMatchStore, highlightedMatchStoreKey } from '../../highlightedMatchStore';
import { config, mount } from '@vue/test-utils';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import { BracketType } from 'types/enums/bracketType';

describe('HighlightedMatchImporter', () => {
    config.global.stubs = {
        IplMultiSelect: true,
        IplButton: true
    };

    const mockGetHighlightedMatches = jest.fn();

    function createHighlightedMatchStore() {
        return createStore<HighlightedMatchStore>({
            state: {
                tournamentData: {
                    meta: {
                        id: 'tournament123',
                        source: TournamentDataSource.UNKNOWN
                    },
                    teams: []
                },
                highlightedMatches: null
            },
            actions: {
                getHighlightedMatches: mockGetHighlightedMatches
            }
        });
    }

    it('has expected match selector label and options when tournament is imported from battlefy', () => {
        const store = createHighlightedMatchStore();
        store.state.tournamentData = {
            meta: {
                id: 'tournament123',
                source: TournamentDataSource.BATTLEFY
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
                plugins: [[store, highlightedMatchStoreKey]]
            }
        });

        const selector = wrapper.getComponent('[data-test="match-selector"]');
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
        const store = createHighlightedMatchStore();
        store.state.tournamentData = {
            meta: {
                id: 'tournament123',
                source: TournamentDataSource.SMASHGG,
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
                plugins: [[store, highlightedMatchStoreKey]]
            }
        });

        const selector = wrapper.getComponent('[data-test="match-selector"]');
        expect(selector.attributes().label).toEqual('Stream');
        expect((selector.vm.$props as { options: unknown }).options).toEqual([
            { value: '123098', name: 'Cool Stream' },
            { value: '5609823', name: 'Cooler Stream' },
            { value: 'all', name: 'All Streams' }
        ]);
    });

    it('dispatches to store when importing', async () => {
        const store = createHighlightedMatchStore();
        const wrapper = mount(HighlightedMatchImporter, {
            global: {
                plugins: [[store, highlightedMatchStoreKey]]
            }
        });

        wrapper.getComponent('[data-test="match-selector"]').vm.$emit('update:modelValue', [{ foo: 'bar' }]);
        await wrapper.vm.$nextTick();
        wrapper.getComponent('[data-test="import-button"]').vm.$emit('click');

        expect(mockGetHighlightedMatches).toHaveBeenCalledWith(expect.any(Object), { options: [{ foo: 'bar' }]});
    });

    it('disables import button when nothing is selected', async () => {
        const store = createHighlightedMatchStore();
        const wrapper = mount(HighlightedMatchImporter, {
            global: {
                plugins: [[store, highlightedMatchStoreKey]]
            }
        });

        wrapper.getComponent('[data-test="match-selector"]').vm.$emit('update:modelValue', []);
        await wrapper.vm.$nextTick();
        expect(wrapper.getComponent('[data-test="import-button"]').attributes().disabled).toEqual('true');
        
        wrapper.getComponent('[data-test="match-selector"]').vm.$emit('update:modelValue', [{ foo: 'bar' }]);
        await wrapper.vm.$nextTick();
        expect(wrapper.getComponent('[data-test="import-button"]').attributes().disabled).toEqual('false');
    });
});
