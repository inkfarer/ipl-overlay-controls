import HighlightedMatchViewer from '../highlightedMatchViewer.vue';
import { createStore } from 'vuex';
import { HighlightedMatchStore, highlightedMatchStoreKey } from '../../highlightedMatchStore';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import { config, mount } from '@vue/test-utils';
import { Team } from 'types/team';
import { NextRoundStore, nextRoundStoreKey } from '../../../store/nextRoundStore';
import { PlayType } from 'types/enums/playType';

describe('HighlightedMatchViewer', () => {
    config.global.stubs = {
        IplSelect: true,
        IplDataRow: true,
        IplButton: true,
        RoundSelect: true,
        FontAwesomeIcon: true
    };

    const mockSetNextMatch = jest.fn();
    const mockTeam: Team = { id: '1234', name: 'mock team', showLogo: false, players: []};

    function createNextRoundStore() {
        return createStore<NextRoundStore>({
            state: {
                nextRound: {
                    teamA: { id: '123123', name: 'cool team A', showLogo: true, players: []},
                    teamB: { id: '345345', name: 'cool team B', showLogo: false, players: []},
                    round: { id: '0387', name: 'dope round', type: PlayType.PLAY_ALL },
                    showOnStream: true,
                    games: []
                }
            }
        });
    }

    function createHighlightedMatchStore() {
        return createStore<HighlightedMatchStore>({
            state: {
                tournamentData: {
                    meta: {
                        id: 'tournament123',
                        source: TournamentDataSource.UNKNOWN,
                        shortName: null
                    },
                    teams: []
                },
                highlightedMatches: null
            },
            actions: {
                setNextMatch: mockSetNextMatch
            }
        });
    }

    it('matches snapshot when no matches are loaded', () => {
        const highlightedMatchStore = createHighlightedMatchStore();
        highlightedMatchStore.state.highlightedMatches = [];
        const nextRoundStore = createNextRoundStore();
        const wrapper = mount(HighlightedMatchViewer, {
            global: {
                plugins: [
                    [highlightedMatchStore, highlightedMatchStoreKey],
                    [nextRoundStore, nextRoundStoreKey]
                ]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot', () => {
        const highlightedMatchStore = createHighlightedMatchStore();
        highlightedMatchStore.state.highlightedMatches = [
            { meta: { name: 'cool match', id: '1234', playType: PlayType.PLAY_ALL }, teamA: mockTeam, teamB: mockTeam },
            { meta: { name: 'cooler match', id: '567' }, teamA: mockTeam, teamB: mockTeam }
        ];
        const nextRoundStore = createNextRoundStore();
        const wrapper = mount(HighlightedMatchViewer, {
            global: {
                plugins: [
                    [highlightedMatchStore, highlightedMatchStoreKey],
                    [nextRoundStore, nextRoundStoreKey]
                ]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('selects first match when highlighted matches are updated', async () => {
        const highlightedMatchStore = createHighlightedMatchStore();
        highlightedMatchStore.state.highlightedMatches = [
            { meta: { name: 'cool match', id: '1234' }, teamA: mockTeam, teamB: mockTeam },
            { meta: { name: 'cooler match', id: '567' }, teamA: mockTeam, teamB: mockTeam }
        ];
        const nextRoundStore = createNextRoundStore();
        const wrapper = mount(HighlightedMatchViewer, {
            global: {
                plugins: [
                    [highlightedMatchStore, highlightedMatchStoreKey],
                    [nextRoundStore, nextRoundStoreKey]
                ]
            }
        });

        expect(wrapper.getComponent('[data-test="match-selector"]').attributes().modelvalue).toEqual('1234');
        highlightedMatchStore.state.highlightedMatches = [
            { meta: { name: 'new match', id: '678' }, teamA: mockTeam, teamB: mockTeam },
            { meta: { name: 'new match 2', id: '3089754' }, teamA: mockTeam, teamB: mockTeam }
        ];
        await wrapper.vm.$nextTick();
        expect(wrapper.getComponent('[data-test="match-selector"]').attributes().modelvalue).toEqual('678');
    });

    it('selects match with same teams as next round if found', async () => {
        const highlightedMatchStore = createHighlightedMatchStore();
        highlightedMatchStore.state.highlightedMatches = [
            { meta: { name: 'cool match', id: '1234' }, teamA: mockTeam, teamB: mockTeam },
            { meta: { name: 'cooler match', id: '567' }, teamA: mockTeam, teamB: mockTeam }
        ];
        const nextRoundStore = createNextRoundStore();
        const wrapper = mount(HighlightedMatchViewer, {
            global: {
                plugins: [
                    [highlightedMatchStore, highlightedMatchStoreKey],
                    [nextRoundStore, nextRoundStoreKey]
                ]
            }
        });

        expect(wrapper.getComponent('[data-test="match-selector"]').attributes().modelvalue).toEqual('1234');
        const mockSelectedTeamA = { ...mockTeam, id: '123123' };
        const mockSelectedTeamB = { ...mockTeam, id: '345345' };
        highlightedMatchStore.state.highlightedMatches = [
            { meta: { name: 'new match', id: '678' }, teamA: mockTeam, teamB: mockTeam },
            { meta: { name: 'new match 2', id: '3089754' }, teamA: mockTeam, teamB: mockTeam },
            { meta: { name: 'coolest match', id: '7396' }, teamA: mockSelectedTeamA, teamB: mockSelectedTeamB }
        ];
        await wrapper.vm.$nextTick();
        expect(wrapper.getComponent('[data-test="match-selector"]').attributes().modelvalue).toEqual('7396');
    });

    it('displays team names for selected match', async () => {
        const highlightedMatchStore = createHighlightedMatchStore();
        highlightedMatchStore.state.highlightedMatches = [
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
        const nextRoundStore = createNextRoundStore();
        const wrapper = mount(HighlightedMatchViewer, {
            global: {
                plugins: [
                    [highlightedMatchStore, highlightedMatchStoreKey],
                    [nextRoundStore, nextRoundStoreKey]
                ]
            }
        });

        wrapper.getComponent('[data-test="match-selector"]').vm.$emit('update:modelValue', '567');
        await wrapper.vm.$nextTick();
        expect(wrapper.getComponent('[data-test="team-a-name-display"]').attributes().value).toEqual('mock team a');
        expect(wrapper.getComponent('[data-test="team-b-name-display"]').attributes().value).toEqual('mock team b');
    });

    it('commits to store on set next match button press', async () => {
        const highlightedMatchStore = createHighlightedMatchStore();
        highlightedMatchStore.state.highlightedMatches = [
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
        const nextRoundStore = createNextRoundStore();
        const wrapper = mount(HighlightedMatchViewer, {
            global: {
                plugins: [
                    [highlightedMatchStore, highlightedMatchStoreKey],
                    [nextRoundStore, nextRoundStoreKey]
                ]
            }
        });

        wrapper.getComponent('[data-test="set-next-match-button"]').vm.$emit('click');

        expect(mockSetNextMatch).toHaveBeenCalledWith(expect.any(Object), {
            teamAId: '1234',
            teamBId: '5678',
            roundId: '0387'
        });
    });

    it('changes update button color when data is changed', async () => {
        const highlightedMatchStore = createHighlightedMatchStore();
        highlightedMatchStore.state.highlightedMatches = [
            { meta: { name: 'cool match', id: '1234' }, teamA: mockTeam, teamB: mockTeam },
            { meta: { name: 'cooler match', id: '567' }, teamA: mockTeam, teamB: mockTeam }
        ];
        const nextRoundStore = createNextRoundStore();
        const wrapper = mount(HighlightedMatchViewer, {
            global: {
                plugins: [
                    [highlightedMatchStore, highlightedMatchStoreKey],
                    [nextRoundStore, nextRoundStoreKey]
                ]
            }
        });

        wrapper.getComponent('[data-test="match-selector"]').vm.$emit('update:modelValue', '567');
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="set-next-match-button"]').attributes().color).toEqual('red');
    });

    it('disables set next match button if selected match data is not found', async () => {
        const highlightedMatchStore = createHighlightedMatchStore();
        highlightedMatchStore.state.highlightedMatches = [
            {
                meta: { name: 'cooler match', id: '567' },
                teamA: mockTeam,
                teamB: mockTeam
            }
        ];
        const nextRoundStore = createNextRoundStore();
        const wrapper = mount(HighlightedMatchViewer, {
            global: {
                plugins: [
                    [highlightedMatchStore, highlightedMatchStoreKey],
                    [nextRoundStore, nextRoundStoreKey]
                ]
            }
        });

        wrapper.getComponent('[data-test="match-selector"]').vm.$emit('update:modelValue', 'something');
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="set-next-match-button"]').attributes().disabled).toEqual('true');
    });
});
