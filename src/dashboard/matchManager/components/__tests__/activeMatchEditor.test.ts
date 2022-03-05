import ActiveRoundEditor from '../activeMatchEditor.vue';
import { createStore } from 'vuex';
import { ActiveRoundStore, activeRoundStoreKey } from '../../../store/activeRoundStore';
import { GameWinner } from 'types/enums/gameWinner';
import { TournamentDataStore, tournamentDataStoreKey } from '../../../store/tournamentDataStore';
import { config, mount } from '@vue/test-utils';
import { PlayType } from 'types/enums/playType';

describe('ActiveRoundEditor', () => {
    config.global.stubs = {
        IplSelect: true,
        IplCheckbox: true,
        FontAwesomeIcon: true,
        IplButton: true,
        IplInput: true
    };

    const mockSetActiveColor = jest.fn();
    const mockSetActiveRound = jest.fn();
    const mockSwapColors = jest.fn();

    function createActiveRoundStore() {
        return createStore<ActiveRoundStore>({
            state: {
                activeRound: {
                    teamA: {
                        score: 0,
                        id: '123123',
                        name: null,
                        showLogo: true,
                        players: null,
                        color: null
                    },
                    teamB: {
                        score: 2,
                        id: '345345',
                        name: null,
                        showLogo: false,
                        players: null,
                        color: null
                    },
                    activeColor: {
                        categoryName: 'Ranked Modes',
                        index: 0,
                        title: 'coolest color',
                        isCustom: false,
                        clrNeutral: '#FFF',
                    },
                    match: {
                        id: '01010',
                        name: 'Rad Match',
                        isCompleted: false,
                        type: PlayType.BEST_OF
                    },
                    games: [
                        {
                            winner: GameWinner.BRAVO,
                            stage: null,
                            mode: null
                        },
                        {
                            winner: GameWinner.BRAVO,
                            stage: null,
                            mode: null
                        },
                        {
                            winner: GameWinner.NO_WINNER,
                            stage: null,
                            mode: null
                        },
                    ],
                },
                swapColorsInternally: false
            },
            actions: {
                swapColors: mockSwapColors,
                setActiveColor: mockSetActiveColor,
                setActiveRound: mockSetActiveRound
            }
        });
    }

    function createTournamentDataStore() {
        return createStore<TournamentDataStore>({
            state: {
                tournamentData: {
                    meta: { id: '1093478', source: 'SMASHGG', shortName: null },
                    teams: [
                        { id: '123123', name: 'cool team A (test long name long name long name long name long name long name long name)', players: [], showLogo: true },
                        { id: '345345', name: 'cool team B', players: [], showLogo: false }
                    ]
                },
                matchStore: {
                    '01010': {
                        meta: { name: 'dope round', isCompleted: false, type: PlayType.PLAY_ALL },
                        teamA: {
                            score: 0,
                            id: '123123',
                            name: null,
                            showLogo: true,
                            players: null,
                            color: null
                        },
                        teamB: {
                            score: 2,
                            id: '345345',
                            name: null,
                            showLogo: false,
                            players: null,
                            color: null
                        },
                        games: []
                    }
                },
                roundStore: {}
            },
            actions: {
                setTeamImageHidden: jest.fn()
            }
        });
    }

    it('matches snapshot and has expected values for select options', () => {
        const tournamentDataStore = createTournamentDataStore();
        const activeRoundStore = createActiveRoundStore();
        const wrapper = mount(ActiveRoundEditor, {
            global: {
                plugins: [[tournamentDataStore, tournamentDataStoreKey], [activeRoundStore, activeRoundStoreKey]]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
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
        const roundSelector = wrapper.getComponent('[data-test="match-selector"]');
        expect(roundSelector.attributes().modelvalue).toEqual('01010');
        expect((roundSelector.vm.$props as { options: unknown }).options).toEqual([
            { name: 'dope round', value: '01010' }
        ]);
    });

    it('handles store data updating', async () => {
        const tournamentDataStore = createTournamentDataStore();
        const activeRoundStore = createActiveRoundStore();
        const wrapper = mount(ActiveRoundEditor, {
            global: {
                plugins: [[tournamentDataStore, tournamentDataStoreKey], [activeRoundStore, activeRoundStoreKey]]
            }
        });

        activeRoundStore.state.activeRound.teamA.id = '678678';
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="team-a-selector"]').attributes().modelvalue).toEqual('678678');
    });

    it('has expected update button color if data is locally changed', async () => {
        const tournamentDataStore = createTournamentDataStore();
        const activeRoundStore = createActiveRoundStore();
        const wrapper = mount(ActiveRoundEditor, {
            global: {
                plugins: [[tournamentDataStore, tournamentDataStoreKey], [activeRoundStore, activeRoundStoreKey]]
            }
        });
        const teamASelector = wrapper.getComponent('[data-test="team-a-selector"]');

        teamASelector.vm.$emit('update:modelValue', '098098');
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="update-match-button"]').attributes().color).toEqual('red');
    });

    it('sends commit to store if team A image toggle is changed', () => {
        const tournamentDataStore = createTournamentDataStore();
        jest.spyOn(tournamentDataStore, 'dispatch');
        const activeRoundStore = createActiveRoundStore();
        const wrapper = mount(ActiveRoundEditor, {
            global: {
                plugins: [[tournamentDataStore, tournamentDataStoreKey], [activeRoundStore, activeRoundStoreKey]]
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
        const tournamentDataStore = createTournamentDataStore();
        jest.spyOn(tournamentDataStore, 'dispatch');
        const activeRoundStore = createActiveRoundStore();
        const wrapper = mount(ActiveRoundEditor, {
            global: {
                plugins: [[tournamentDataStore, tournamentDataStoreKey], [activeRoundStore, activeRoundStoreKey]]
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
        const tournamentDataStore = createTournamentDataStore();
        const activeRoundStore = createActiveRoundStore();
        jest.spyOn(activeRoundStore, 'dispatch');
        const wrapper = mount(ActiveRoundEditor, {
            global: {
                plugins: [[tournamentDataStore, tournamentDataStoreKey], [activeRoundStore, activeRoundStoreKey]]
            }
        });
        wrapper.getComponent('[name="matchName"]').vm.$emit('update:modelValue', 'Match Name');
        const updateButton = wrapper.getComponent('[data-test="update-match-button"]');

        updateButton.vm.$emit('click');

        expect(activeRoundStore.dispatch).toHaveBeenCalledWith('setActiveRound', {
            teamAId: '123123',
            teamBId: '345345',
            matchId: '01010',
            matchName: 'Match Name'
        });
    });

    it('reverts updates on update button right click', async () => {
        const tournamentDataStore = createTournamentDataStore();
        const activeRoundStore = createActiveRoundStore();
        const wrapper = mount(ActiveRoundEditor, {
            global: {
                plugins: [[tournamentDataStore, tournamentDataStoreKey], [activeRoundStore, activeRoundStoreKey]]
            }
        });
        const event = new Event(null);
        jest.spyOn(event, 'preventDefault');

        wrapper.getComponent('[name="matchName"]').vm.$emit('update:modelValue', 'Match Name');
        wrapper.getComponent('[data-test="team-a-selector"]').vm.$emit('update:modelValue', 'newteam1id');
        wrapper.getComponent('[data-test="update-match-button"]').vm.$emit('right-click', event);
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[name="matchName"]').attributes().modelvalue).toEqual('Rad Match');
        expect(wrapper.getComponent('[data-test="team-a-selector"]').attributes().modelvalue).toEqual('123123');
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('does not display message if selected round has no progress and round data is unchanged', () => {
        const activeRoundStore = createActiveRoundStore();
        const tournamentDataStore = createTournamentDataStore();
        tournamentDataStore.state.roundStore = {
            '0387': {
                meta: { name: 'dope round', isCompleted: false, type: PlayType.PLAY_ALL },
                teamA: { id: '123123', name: 'Cool Team', score: 0, showLogo: true, players: []},
                teamB: { id: '345345', name: 'Cool Team 2', score: 0, showLogo: true, players: []},
                games: []
            }
        };
        const wrapper = mount(ActiveRoundEditor, {
            global: {
                plugins: [[tournamentDataStore, tournamentDataStoreKey], [activeRoundStore, activeRoundStoreKey]]
            }
        });

        expect(wrapper.findComponent('[data-test="match-progress-message"]').exists()).toEqual(false);
    });

    it('does not display message if selected round has no progress', async () => {
        const activeRoundStore = createActiveRoundStore();
        const tournamentDataStore = createTournamentDataStore();
        tournamentDataStore.state.matchStore = {
            '0387': {
                meta: { name: 'dope round', isCompleted: false, type: PlayType.BEST_OF },
                teamA: { id: '123123', name: 'Cool Team', score: 0, showLogo: true, players: []},
                teamB: { id: '345345', name: 'Cool Team 2', score: 0, showLogo: true, players: []},
                games: []
            }
        };
        const wrapper = mount(ActiveRoundEditor, {
            global: {
                plugins: [[tournamentDataStore, tournamentDataStoreKey], [activeRoundStore, activeRoundStoreKey]]
            }
        });
        wrapper.getComponent('[data-test="team-a-selector"]').vm.$emit('update:modelValue', '098098');
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent('[data-test="match-progress-message"]').exists()).toEqual(false);
    });

    it('does not display message if selected round has progress but data is not changed', () => {
        const activeRoundStore = createActiveRoundStore();
        const tournamentDataStore = createTournamentDataStore();
        tournamentDataStore.state.roundStore = {
            '0387': {
                meta: { name: 'dope round', isCompleted: false, type: PlayType.BEST_OF },
                teamA: { id: '123123', name: 'Cool Team', score: 0, showLogo: true, players: []},
                teamB: { id: '345345', name: 'Cool Team 2', score: 1, showLogo: true, players: []},
                games: []
            }
        };
        const wrapper = mount(ActiveRoundEditor, {
            global: {
                plugins: [[tournamentDataStore, tournamentDataStoreKey], [activeRoundStore, activeRoundStoreKey]]
            }
        });

        expect(wrapper.findComponent('[data-test="match-progress-message"]').exists()).toEqual(false);
    });

    it('displays message if selected round has progress', async () => {
        const activeRoundStore = createActiveRoundStore();
        const tournamentDataStore = createTournamentDataStore();
        tournamentDataStore.state.matchStore = {
            '01010': {
                meta: { name: 'dope round', isCompleted: false, type: PlayType.BEST_OF },
                teamA: { id: '123123', name: 'Cool Team (long name long name long name long name long name)', score: 0, showLogo: true, players: []},
                teamB: { id: '345345', name: 'Cool Team 2', score: 1, showLogo: true, players: []},
                games: []
            }
        };
        const wrapper = mount(ActiveRoundEditor, {
            global: {
                plugins: [[tournamentDataStore, tournamentDataStoreKey], [activeRoundStore, activeRoundStoreKey]]
            }
        });

        wrapper.getComponent('[data-test="team-a-selector"]').vm.$emit('update:modelValue', '098098');
        await wrapper.vm.$nextTick();

        const roundProgressMessage = wrapper.findComponent('[data-test="match-progress-message"]');
        expect(roundProgressMessage.exists()).toEqual(true);
        expect(roundProgressMessage.text()).toEqual('\'dope round\' already has saved progress. (Cool Team (long name long name long name long... vs Cool Team 2)');
    });

    it('displays message if selected round is completed', async () => {
        const activeRoundStore = createActiveRoundStore();
        const tournamentDataStore = createTournamentDataStore();
        tournamentDataStore.state.matchStore = {
            '01010': {
                meta: { name: 'dope round', isCompleted: true, type: PlayType.PLAY_ALL },
                teamA: { id: '123123', name: 'Cool Team', score: 2, showLogo: true, players: []},
                teamB: { id: '345345', name: 'Cool Team 2', score: 1, showLogo: true, players: []},
                games: []
            }
        };
        const wrapper = mount(ActiveRoundEditor, {
            global: {
                plugins: [[tournamentDataStore, tournamentDataStoreKey], [activeRoundStore, activeRoundStoreKey]]
            }
        });

        wrapper.getComponent('[data-test="team-a-selector"]').vm.$emit('update:modelValue', '098098');
        await wrapper.vm.$nextTick();

        const roundProgressMessage = wrapper.findComponent('[data-test="match-progress-message"]');
        expect(roundProgressMessage.exists()).toEqual(true);
        expect(roundProgressMessage.text()).toEqual('\'dope round\' is already completed. (Cool Team vs Cool Team 2)');
    });

    it('changes selected teams if a new round is selected', async () => {
        const activeRoundStore = createActiveRoundStore();
        const tournamentDataStore = createTournamentDataStore();
        tournamentDataStore.state.matchStore = {
            '0387': {
                meta: { name: 'dope round', isCompleted: true, type: PlayType.BEST_OF },
                teamA: { id: '123123', name: 'Cool Team', score: 2, showLogo: true, players: []},
                teamB: { id: '345345', name: 'Cool Team 2', score: 1, showLogo: true, players: []},
                games: []
            },
            '12345': {
                meta: { name: 'dope round 2', isCompleted: false, type: PlayType.PLAY_ALL },
                teamA: { id: '789789', name: 'Cool Team 3', score: 2, showLogo: true, players: []},
                teamB: { id: '678678', name: 'Cool Team 4', score: 1, showLogo: true, players: []},
                games: []
            }
        };
        const wrapper = mount(ActiveRoundEditor, {
            global: {
                plugins: [[tournamentDataStore, tournamentDataStoreKey], [activeRoundStore, activeRoundStoreKey]]
            }
        });
        const roundSelector = wrapper.getComponent('[data-test="match-selector"]');

        roundSelector.vm.$emit('update:modelValue', '12345');
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent('[data-test="match-progress-message"]').text()).toEqual('\'dope round 2\' already has saved progress. (Cool Team 3 vs Cool Team 4)');
        expect(wrapper.getComponent('[data-test="team-a-selector"]').attributes().modelvalue).toEqual('789789');
        expect(wrapper.getComponent('[data-test="team-b-selector"]').attributes().modelvalue).toEqual('678678');
    });
});
