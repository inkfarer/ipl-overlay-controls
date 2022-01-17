import NextRound from '../nextRound.vue';
import { createStore } from 'vuex';
import { NextRoundStore, nextRoundStoreKey } from '../../store/nextRoundStore';
import { TournamentDataStore, tournamentDataStoreKey } from '../../store/tournamentDataStore';
import { config, mount } from '@vue/test-utils';

describe('NextRound', () => {
    config.global.stubs = {
        IplSelect: true,
        IplCheckbox: true,
        IplButton: true,
        IplErrorDisplay: true
    };

    function createNextRoundStore() {
        return createStore<NextRoundStore>({
            state: {
                nextRound: {
                    teamA: { id: '123123', name: 'cool team A', showLogo: true, players: []},
                    teamB: { id: '345345', name: 'cool team B', showLogo: false, players: []},
                    round: { id: '0387', name: 'dope round' },
                    showOnStream: true,
                    games: []
                }
            },
            mutations: {
                setShowOnStream: jest.fn()
            },
            actions: {
                beginNextMatch: jest.fn(),
                setNextRound: jest.fn()
            }
        });
    }

    function createTournamentDataStore() {
        return createStore<TournamentDataStore>({
            state: {
                tournamentData: {
                    meta: { id: '1093478', source: 'SMASHGG' },
                    teams: [
                        { id: '123123', name: 'cool team A (test long name long name long name long name long name long name long name)', players: [], showLogo: true },
                        { id: '345345', name: 'cool team B', players: [], showLogo: false }
                    ]
                },
                roundStore: {
                    '0387': {
                        meta: { name: 'dope round', isCompleted: false },
                        games: []
                    }
                }
            },
            actions: {
                setTeamImageHidden: jest.fn()
            }
        });
    }

    it('sets expected values and options for selectors and checkboxes', () => {
        const nextRoundStore = createNextRoundStore();
        const tournamentDataStore = createTournamentDataStore();
        const wrapper = mount(NextRound, {
            global: {
                plugins: [
                    [ nextRoundStore, nextRoundStoreKey ],
                    [ tournamentDataStore, tournamentDataStoreKey ]
                ]
            }
        });

        const teamASelector = wrapper.getComponent('[data-test="team-a-selector"]');
        expect(teamASelector.attributes().modelvalue).toEqual('123123');
        expect((teamASelector.vm.$props as { options: unknown }).options).toEqual([
            { name: 'cool team A (test long name long name long na...', value: '123123' },
            { name: 'cool team B', value: '345345' }
        ]);
        const teamBSelector = wrapper.getComponent('[data-test="team-b-selector"]');
        expect(teamBSelector.attributes().modelvalue).toEqual('345345');
        expect((teamBSelector.vm.$props as { options: unknown }).options).toEqual([
            { name: 'cool team A (test long name long name long na...', value: '123123' },
            { name: 'cool team B', value: '345345' }
        ]);
        const roundSelector = wrapper.getComponent('[data-test="round-selector"]');
        expect(roundSelector.attributes().modelvalue).toEqual('0387');
        expect((roundSelector.vm.$props as { options: unknown }).options).toEqual([
            { name: 'dope round', value: '0387' }
        ]);
        expect(wrapper.getComponent('[data-test="show-on-stream-toggle"]').attributes().modelvalue).toEqual('true');
        expect(wrapper.getComponent('[data-test="team-a-image-toggle"]').attributes().modelvalue).toEqual('true');
        expect(wrapper.getComponent('[data-test="team-b-image-toggle"]').attributes().modelvalue).toEqual('false');
    });

    it('handles store data updating', async () => {
        const nextRoundStore = createNextRoundStore();
        const tournamentDataStore = createTournamentDataStore();
        const wrapper = mount(NextRound, {
            global: {
                plugins: [
                    [ nextRoundStore, nextRoundStoreKey ],
                    [ tournamentDataStore, tournamentDataStoreKey ]
                ]
            }
        });

        nextRoundStore.state.nextRound.teamA.id = '678678';
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="team-a-selector"]').attributes().modelvalue).toEqual('678678');
    });

    it('has expected update button color if data is locally changed', async () => {
        const nextRoundStore = createNextRoundStore();
        const tournamentDataStore = createTournamentDataStore();
        const wrapper = mount(NextRound, {
            global: {
                plugins: [
                    [ nextRoundStore, nextRoundStoreKey ],
                    [ tournamentDataStore, tournamentDataStoreKey ]
                ]
            }
        });
        const teamASelector = wrapper.getComponent('[data-test="team-a-selector"]');

        teamASelector.vm.$emit('update:modelValue', '098098');
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="update-next-round-button"]').attributes().color).toEqual('red');
    });

    it('sends commit to store if team A image toggle is changed', () => {
        const nextRoundStore = createNextRoundStore();
        const tournamentDataStore = createTournamentDataStore();
        jest.spyOn(tournamentDataStore, 'dispatch');
        const wrapper = mount(NextRound, {
            global: {
                plugins: [
                    [ nextRoundStore, nextRoundStoreKey ],
                    [ tournamentDataStore, tournamentDataStoreKey ]
                ]
            }
        });
        const teamAImageToggle = wrapper.getComponent('[data-test="team-a-image-toggle"]');

        teamAImageToggle.vm.$emit('update:modelValue', false);

        expect(tournamentDataStore.dispatch).toHaveBeenCalledWith('setTeamImageHidden', {
            teamId: '123123',
            isVisible: false
        });
    });

    it('sends commit to store if team B image toggle is changed', () => {
        const nextRoundStore = createNextRoundStore();
        const tournamentDataStore = createTournamentDataStore();
        jest.spyOn(tournamentDataStore, 'dispatch');
        const wrapper = mount(NextRound, {
            global: {
                plugins: [
                    [ nextRoundStore, nextRoundStoreKey ],
                    [ tournamentDataStore, tournamentDataStoreKey ]
                ]
            }
        });
        const teamBImageToggle = wrapper.getComponent('[data-test="team-b-image-toggle"]');

        teamBImageToggle.vm.$emit('update:modelValue', true);

        expect(tournamentDataStore.dispatch).toHaveBeenCalledWith('setTeamImageHidden', {
            teamId: '345345',
            isVisible: true
        });
    });

    it('updates round data on update button click', () => {
        const nextRoundStore = createNextRoundStore();
        jest.spyOn(nextRoundStore, 'dispatch');
        const tournamentDataStore = createTournamentDataStore();
        const wrapper = mount(NextRound, {
            global: {
                plugins: [
                    [ nextRoundStore, nextRoundStoreKey ],
                    [ tournamentDataStore, tournamentDataStoreKey ]
                ]
            }
        });
        const updateButton = wrapper.getComponent('[data-test="update-next-round-button"]');

        updateButton.vm.$emit('click');

        expect(nextRoundStore.dispatch).toHaveBeenCalledWith('setNextRound', {
            teamAId: '123123',
            teamBId: '345345',
            roundId: '0387'
        });
    });

    it('sends commit to store on show on stream toggle change', () => {
        const nextRoundStore = createNextRoundStore();
        jest.spyOn(nextRoundStore, 'commit');
        const tournamentDataStore = createTournamentDataStore();
        const wrapper = mount(NextRound, {
            global: {
                plugins: [
                    [ nextRoundStore, nextRoundStoreKey ],
                    [ tournamentDataStore, tournamentDataStoreKey ]
                ]
            }
        });
        const showOnStreamToggle = wrapper.getComponent('[data-test="show-on-stream-toggle"]');

        showOnStreamToggle.vm.$emit('update:modelValue', false);

        expect(nextRoundStore.commit).toHaveBeenCalledWith('setShowOnStream', false);
    });

    it('dispatches action on begin next match button click', () => {
        const nextRoundStore = createNextRoundStore();
        jest.spyOn(nextRoundStore, 'dispatch');
        const tournamentDataStore = createTournamentDataStore();
        const wrapper = mount(NextRound, {
            global: {
                plugins: [
                    [ nextRoundStore, nextRoundStoreKey ],
                    [ tournamentDataStore, tournamentDataStoreKey ]
                ]
            }
        });
        const beginNextMatchButton = wrapper.getComponent('[data-test="begin-next-match-button"]');

        beginNextMatchButton.vm.$emit('click');

        expect(nextRoundStore.dispatch).toHaveBeenCalledWith('beginNextMatch');
    });

    it('does not display message if selected round has no progress', () => {
        const nextRoundStore = createNextRoundStore();
        const tournamentDataStore = createTournamentDataStore();
        tournamentDataStore.state.roundStore = {
            '0387': {
                meta: { name: 'dope round', isCompleted: false },
                teamA: { id: '123123', name: 'Cool Team', score: 0, showLogo: true, players: []},
                teamB: { id: '345345', name: 'Cool Team 2', score: 0, showLogo: true, players: []},
                games: []
            }
        };
        const wrapper = mount(NextRound, {
            global: {
                plugins: [
                    [ nextRoundStore, nextRoundStoreKey ],
                    [ tournamentDataStore, tournamentDataStoreKey ]
                ]
            }
        });

        expect(wrapper.findComponent('[data-test="round-progress-message"]').exists()).toEqual(false);
    });

    it('displays message if selected round has progress', () => {
        const nextRoundStore = createNextRoundStore();
        const tournamentDataStore = createTournamentDataStore();
        tournamentDataStore.state.roundStore = {
            '0387': {
                meta: { name: 'dope round', isCompleted: false },
                teamA: { id: '123123', name: 'Cool Team', score: 0, showLogo: true, players: []},
                teamB: { id: '345345', name: 'Cool Team 2 (long name long name long name long name long name)', score: 1, showLogo: true, players: []},
                games: []
            }
        };
        const wrapper = mount(NextRound, {
            global: {
                plugins: [
                    [ nextRoundStore, nextRoundStoreKey ],
                    [ tournamentDataStore, tournamentDataStoreKey ]
                ]
            }
        });

        const roundProgressMessage = wrapper.findComponent('[data-test="round-progress-message"]');
        expect(roundProgressMessage.exists()).toEqual(true);
        expect(roundProgressMessage.isVisible()).toEqual(true);
        expect(roundProgressMessage.text()).toEqual('\'dope round\' already has saved progress. (Cool Team vs Cool Team 2 (long name long name long name lo...)');
    });

    it('displays message if selected round is completed', () => {
        const nextRoundStore = createNextRoundStore();
        const tournamentDataStore = createTournamentDataStore();
        tournamentDataStore.state.roundStore = {
            '0387': {
                meta: { name: 'dope round', isCompleted: true },
                teamA: { id: '123123', name: 'Cool Team', score: 2, showLogo: true, players: []},
                teamB: { id: '345345', name: 'Cool Team 2', score: 1, showLogo: true, players: []},
                games: []
            }
        };
        const wrapper = mount(NextRound, {
            global: {
                plugins: [
                    [ nextRoundStore, nextRoundStoreKey ],
                    [ tournamentDataStore, tournamentDataStoreKey ]
                ]
            }
        });

        const roundProgressMessage = wrapper.findComponent('[data-test="round-progress-message"]');
        expect(roundProgressMessage.exists()).toEqual(true);
        expect(roundProgressMessage.isVisible()).toEqual(true);
        expect(roundProgressMessage.text()).toEqual('\'dope round\' is already completed. (Cool Team vs Cool Team 2)');
    });

    it('changes selected teams if a new round with progress is selected', async () => {
        const nextRoundStore = createNextRoundStore();
        const tournamentDataStore = createTournamentDataStore();
        tournamentDataStore.state.roundStore = {
            '0387': {
                meta: { name: 'dope round', isCompleted: true },
                teamA: { id: '123123', name: 'Cool Team', score: 2, showLogo: true, players: []},
                teamB: { id: '345345', name: 'Cool Team 2', score: 1, showLogo: true, players: []},
                games: []
            },
            '12345': {
                meta: { name: 'dope round 2', isCompleted: false },
                teamA: { id: '789789', name: 'Cool Team 3', score: 2, showLogo: true, players: []},
                teamB: { id: '678678', name: 'Cool Team 4', score: 1, showLogo: true, players: []},
                games: []
            }
        };
        const wrapper = mount(NextRound, {
            global: {
                plugins: [
                    [ nextRoundStore, nextRoundStoreKey ],
                    [ tournamentDataStore, tournamentDataStoreKey ]
                ]
            }
        });
        const roundSelector = wrapper.getComponent('[data-test="round-selector"]');

        roundSelector.vm.$emit('update:modelValue', '12345');
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent('[data-test="round-progress-message"]').text()).toEqual('\'dope round 2\' already has saved progress. (Cool Team 3 vs Cool Team 4)');
        expect(wrapper.getComponent('[data-test="team-a-selector"]').attributes().modelvalue).toEqual('789789');
        expect(wrapper.getComponent('[data-test="team-b-selector"]').attributes().modelvalue).toEqual('678678');
    });

    it('changes selected teams to next round teams if a new round without progress is selected', async () => {
        const nextRoundStore = createNextRoundStore();
        nextRoundStore.state.nextRound = {
            teamA: { id: '567234', name: 'cool team G', showLogo: true, players: []},
            teamB: { id: '123098', name: 'cool team Z', showLogo: false, players: []},
            round: { id: '0387', name: 'dope round' },
            showOnStream: true,
            games: []
        };
        const tournamentDataStore = createTournamentDataStore();
        tournamentDataStore.state.roundStore = {
            '0387': {
                meta: { name: 'dope round', isCompleted: true },
                teamA: { id: '123123', name: 'Cool Team', score: 2, showLogo: true, players: []},
                teamB: { id: '345345', name: 'Cool Team 2', score: 1, showLogo: true, players: []},
                games: []
            },
            '12345': {
                meta: { name: 'dope round 2', isCompleted: false },
                teamA: { id: '789789', name: 'Cool Team 3', score: 2, showLogo: true, players: []},
                teamB: { id: '678678', name: 'Cool Team 4', score: 1, showLogo: true, players: []},
                games: []
            },
            '123456': {
                meta: { name: 'dope round 3', isCompleted: false },
                games: []
            }
        };
        const wrapper = mount(NextRound, {
            global: {
                plugins: [
                    [ nextRoundStore, nextRoundStoreKey ],
                    [ tournamentDataStore, tournamentDataStoreKey ]
                ]
            }
        });
        const roundSelector = wrapper.getComponent('[data-test="round-selector"]');

        roundSelector.vm.$emit('update:modelValue', '12345');
        await wrapper.vm.$nextTick();
        roundSelector.vm.$emit('update:modelValue', '123456');
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent('[data-test="round-progress-message"]').exists()).toEqual(false);
        expect(wrapper.getComponent('[data-test="team-a-selector"]').attributes().modelvalue).toEqual('567234');
        expect(wrapper.getComponent('[data-test="team-b-selector"]').attributes().modelvalue).toEqual('123098');
    });
});
