import NextMatchEditor from '../nextMatchEditor.vue';
import { createStore } from 'vuex';
import { NextRoundStore, nextRoundStoreKey } from '../../../store/nextRoundStore';
import { TournamentDataStore, tournamentDataStoreKey } from '../../../store/tournamentDataStore';
import { config, mount } from '@vue/test-utils';

describe('NextMatchEditor', () => {
    config.global.stubs = {
        IplSelect: true,
        IplCheckbox: true,
        IplButton: true,
        IplErrorDisplay: true,
        IplInput: true
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
                        meta: { name: 'dope round' },
                        games: []
                    }
                },
                matchStore: {}
            },
            actions: {
                setTeamImageHidden: jest.fn()
            }
        });
    }

    it('sets expected values and options for selectors and checkboxes', () => {
        const nextRoundStore = createNextRoundStore();
        const tournamentDataStore = createTournamentDataStore();
        const wrapper = mount(NextMatchEditor, {
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
        const wrapper = mount(NextMatchEditor, {
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
        const wrapper = mount(NextMatchEditor, {
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
        const wrapper = mount(NextMatchEditor, {
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
        const wrapper = mount(NextMatchEditor, {
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
        const wrapper = mount(NextMatchEditor, {
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
        const wrapper = mount(NextMatchEditor, {
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
        const wrapper = mount(NextMatchEditor, {
            global: {
                plugins: [
                    [ nextRoundStore, nextRoundStoreKey ],
                    [ tournamentDataStore, tournamentDataStoreKey ]
                ]
            }
        });
        wrapper.getComponent('[name="matchName"]').vm.$emit('update:modelValue', 'Match Name');
        const beginNextMatchButton = wrapper.getComponent('[data-test="begin-next-match-button"]');

        beginNextMatchButton.vm.$emit('click');

        expect(nextRoundStore.dispatch).toHaveBeenCalledWith('beginNextMatch', { matchName: 'Match Name' });
    });

    it('disables begin next match button if match name field is invalid', async () => {
        const nextRoundStore = createNextRoundStore();
        jest.spyOn(nextRoundStore, 'dispatch');
        const tournamentDataStore = createTournamentDataStore();
        const wrapper = mount(NextMatchEditor, {
            global: {
                plugins: [
                    [ nextRoundStore, nextRoundStoreKey ],
                    [ tournamentDataStore, tournamentDataStoreKey ]
                ]
            }
        });

        wrapper.getComponent('[name="matchName"]').vm.$emit('update:modelValue', '');
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="begin-next-match-button"]').attributes().disabled).toEqual('true');
    });
});