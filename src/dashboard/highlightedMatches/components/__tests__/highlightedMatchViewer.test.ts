import HighlightedMatchViewer from '../highlightedMatchViewer.vue';
import { createStore } from 'vuex';
import { HighlightedMatchStore, highlightedMatchStoreKey } from '../../highlightedMatchStore';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import { config, mount } from '@vue/test-utils';
import { Team } from 'types/team';

describe('HighlightedMatchViewer', () => {
    config.global.stubs = {
        IplSelect: true,
        IplDataRow: true,
        IplButton: true
    };

    const mockSetNextMatch = jest.fn();
    const mockTeam: Team = { id: '1234', name: 'mock team', showLogo: false, players: []};

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
            mutations: {
                setNextMatch: mockSetNextMatch
            }
        });
    }

    it('matches snapshot when no matches are loaded', () => {
        const store = createHighlightedMatchStore();
        store.state.highlightedMatches = [];
        const wrapper = mount(HighlightedMatchViewer, {
            global: {
                plugins: [[store, highlightedMatchStoreKey]]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot', () => {
        const store = createHighlightedMatchStore();
        store.state.highlightedMatches = [
            { meta: { name: 'cool match', id: '1234' }, teamA: mockTeam, teamB: mockTeam },
            { meta: { name: 'cooler match', id: '567' }, teamA: mockTeam, teamB: mockTeam }
        ];
        const wrapper = mount(HighlightedMatchViewer, {
            global: {
                plugins: [[store, highlightedMatchStoreKey]]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('selects first match when highlighted matches are updated', async () => {
        const store = createHighlightedMatchStore();
        store.state.highlightedMatches = [
            { meta: { name: 'cool match', id: '1234' }, teamA: mockTeam, teamB: mockTeam },
            { meta: { name: 'cooler match', id: '567' }, teamA: mockTeam, teamB: mockTeam }
        ];
        const wrapper = mount(HighlightedMatchViewer, {
            global: {
                plugins: [[store, highlightedMatchStoreKey]]
            }
        });

        expect(wrapper.getComponent('[data-test="match-selector"]').attributes().modelvalue).toEqual('1234');
        store.state.highlightedMatches = [
            { meta: { name: 'new match', id: '678' }, teamA: mockTeam, teamB: mockTeam },
            { meta: { name: 'new match 2', id: '3089754' }, teamA: mockTeam, teamB: mockTeam }
        ];
        await wrapper.vm.$nextTick();
        expect(wrapper.getComponent('[data-test="match-selector"]').attributes().modelvalue).toEqual('678');
    });

    it('displays team names for selected match', async () => {
        const store = createHighlightedMatchStore();
        store.state.highlightedMatches = [
            { meta: { name: 'cool match', id: '1234' }, teamA: mockTeam, teamB: mockTeam },
            {
                meta: { name: 'cooler match', id: '567' },
                teamA: {
                    ...mockTeam,
                    name: 'mock team a'
                },
                teamB: {
                    ...mockTeam,
                    name: 'mock team b'
                }
            }
        ];
        const wrapper = mount(HighlightedMatchViewer, {
            global: {
                plugins: [[store, highlightedMatchStoreKey]]
            }
        });

        wrapper.getComponent('[data-test="match-selector"]').vm.$emit('update:modelValue', '567');
        await wrapper.vm.$nextTick();
        expect(wrapper.getComponent('[data-test="team-a-name-display"]').attributes().value).toEqual('mock team a');
        expect(wrapper.getComponent('[data-test="team-b-name-display"]').attributes().value).toEqual('mock team b');
    });

    it('commits to store on set next match button press', async () => {
        const store = createHighlightedMatchStore();
        store.state.highlightedMatches = [
            {
                meta: { name: 'cooler match', id: '567' },
                teamA: {
                    ...mockTeam,
                    id: '1234'
                },
                teamB: {
                    ...mockTeam,
                    id: '5678'
                }
            }
        ];
        const wrapper = mount(HighlightedMatchViewer, {
            global: {
                plugins: [[store, highlightedMatchStoreKey]]
            }
        });

        wrapper.getComponent('[data-test="set-next-match-button"]').vm.$emit('click');

        expect(mockSetNextMatch).toHaveBeenCalledWith(expect.any(Object), {
            teamAId: '1234',
            teamBId: '5678'
        });
    });

    it('disables set next match button if selected match data is not found', async () => {
        const store = createHighlightedMatchStore();
        store.state.highlightedMatches = [
            {
                meta: { name: 'cooler match', id: '567' },
                teamA: mockTeam,
                teamB: mockTeam
            }
        ];
        const wrapper = mount(HighlightedMatchViewer, {
            global: {
                plugins: [[store, highlightedMatchStoreKey]]
            }
        });

        wrapper.getComponent('[data-test="match-selector"]').vm.$emit('update:modelValue', 'something');
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="set-next-match-button"]').attributes().disabled).toEqual('true');
    });
});
