import Rounds from '../rounds.vue';
import { config, mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import { TournamentDataStore, tournamentDataStoreKey } from '../../store/tournamentDataStore';
import { nextRoundStoreKey } from '../../store/nextRoundStore';
import { PlayType } from 'types/enums/playType';

describe('Rounds', () => {
    config.global.stubs = {
        FontAwesomeIcon: true,
        IplButton: true,
        RoundEditor: true,
        IplErrorDisplay: true
    };

    const mockResetRoundStore = jest.fn();

    function createTournamentDataStore() {
        return createStore<TournamentDataStore>({
            state: {
                tournamentData: {
                    meta: { id: '1093478', source: 'SMASHGG', shortName: null },
                    teams: [
                        { id: '123123', name: 'cool team A', players: [], showLogo: true },
                        { id: '345345', name: 'cool team B', players: [], showLogo: false }
                    ]
                },
                roundStore: {
                    '0387': {
                        meta: { name: 'dope round', type: PlayType.BEST_OF },
                        games: []
                    },
                    '9573': {
                        meta: { name: 'dope round the second', type: PlayType.PLAY_ALL },
                        games: []
                    },
                    '2426': {
                        meta: { name: 'dope round the third', type: PlayType.BEST_OF },
                        games: []
                    }
                },
                matchStore: {}
            },
            actions: {
                resetRoundStore: mockResetRoundStore
            }
        });
    }

    function createNextRoundStore() {
        return createStore({
            state: {
                nextRound: {
                    round: {
                        id: '2426'
                    }
                }
            }
        });
    }

    it('matches snapshot', () => {
        const store = createTournamentDataStore();
        const nextRoundStore = createNextRoundStore();
        const wrapper = mount(Rounds, {
            global: {
                plugins: [
                    [store, tournamentDataStoreKey],
                    [nextRoundStore, nextRoundStoreKey]
                ]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot when round sidebar is open', async () => {
        const store = createTournamentDataStore();
        const nextRoundStore = createNextRoundStore();
        const wrapper = mount(Rounds, {
            global: {
                plugins: [
                    [store, tournamentDataStoreKey],
                    [nextRoundStore, nextRoundStoreKey]
                ]
            }
        });

        await wrapper.get('[data-test="open-all-rounds-sidebar"]').trigger('click');

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('resets round store on reset button click', async () => {
        const store = createTournamentDataStore();
        const nextRoundStore = createNextRoundStore();
        const wrapper = mount(Rounds, {
            global: {
                plugins: [
                    [store, tournamentDataStoreKey],
                    [nextRoundStore, nextRoundStoreKey]
                ]
            }
        });

        await wrapper.get('[data-test="open-all-rounds-sidebar"]').trigger('click');
        wrapper.getComponent('[data-test="reset-rounds-button"]').vm.$emit('click');

        expect(mockResetRoundStore).toHaveBeenCalled();
    });

    it('selects expected round by default', async () => {
        const store = createTournamentDataStore();
        const nextRoundStore = createNextRoundStore();
        const wrapper = mount(Rounds, {
            global: {
                plugins: [
                    [store, tournamentDataStoreKey],
                    [nextRoundStore, nextRoundStoreKey]
                ]
            }
        });
        const roundEditor = wrapper.getComponent('[data-test="round-editor"]');

        expect(roundEditor.props().roundId).toEqual('2426');
        expect(roundEditor.props().round).toEqual({
            games: [],
            meta: {
                name: 'dope round the third',
                type: PlayType.BEST_OF
            }
        });
        expect(roundEditor.props().isNewRound).toEqual(false);
    });

    it('switches selected round when round is selected from sidebar', async () => {
        const store = createTournamentDataStore();
        const nextRoundStore = createNextRoundStore();
        const wrapper = mount(Rounds, {
            global: {
                plugins: [
                    [store, tournamentDataStoreKey],
                    [nextRoundStore, nextRoundStoreKey]
                ]
            }
        });
        const roundEditor = wrapper.getComponent('[data-test="round-editor"]');

        await wrapper.get('[data-test="open-all-rounds-sidebar"]').trigger('click');
        wrapper.getComponent('[data-test="round-option-9573"]').vm.$emit('click');
        await wrapper.vm.$nextTick();

        expect(roundEditor.props().roundId).toEqual('9573');
        expect(roundEditor.props().round).toEqual({
            games: [],
            meta: {
                name: 'dope round the second',
                type: PlayType.PLAY_ALL
            }
        });
        expect(roundEditor.props().isNewRound).toEqual(false);
    });

    it('handles new 3-game round being created', async () => {
        const store = createTournamentDataStore();
        const nextRoundStore = createNextRoundStore();
        const wrapper = mount(Rounds, {
            global: {
                plugins: [
                    [store, tournamentDataStoreKey],
                    [nextRoundStore, nextRoundStoreKey]
                ]
            }
        });
        const roundEditor = wrapper.getComponent('[data-test="round-editor"]');

        wrapper.getComponent('[data-test="new-3-game-round"]').vm.$emit('click');
        await wrapper.vm.$nextTick();

        expect(roundEditor.props().round).toEqual({
            games: [
                { mode: 'Unknown Mode', stage: 'Unknown Stage' },
                { mode: 'Unknown Mode', stage: 'Unknown Stage' },
                { mode: 'Unknown Mode', stage: 'Unknown Stage' }
            ],
            meta: {
                name: 'New Round',
                type: PlayType.BEST_OF
            }
        });
        expect(roundEditor.props().isNewRound).toEqual(true);
    });

    it('handles new 5-game round being created', async () => {
        const store = createTournamentDataStore();
        const nextRoundStore = createNextRoundStore();
        const wrapper = mount(Rounds, {
            global: {
                plugins: [
                    [store, tournamentDataStoreKey],
                    [nextRoundStore, nextRoundStoreKey]
                ]
            }
        });
        const roundEditor = wrapper.getComponent('[data-test="round-editor"]');

        wrapper.getComponent('[data-test="new-5-game-round"]').vm.$emit('click');
        await wrapper.vm.$nextTick();

        expect(roundEditor.props().round).toEqual({
            games: [
                { mode: 'Unknown Mode', stage: 'Unknown Stage' },
                { mode: 'Unknown Mode', stage: 'Unknown Stage' },
                { mode: 'Unknown Mode', stage: 'Unknown Stage' },
                { mode: 'Unknown Mode', stage: 'Unknown Stage' },
                { mode: 'Unknown Mode', stage: 'Unknown Stage' }
            ],
            meta: {
                name: 'New Round',
                type: PlayType.BEST_OF
            }
        });
        expect(roundEditor.props().isNewRound).toEqual(true);
    });

    it('handles new 7-game round being created', async () => {
        const store = createTournamentDataStore();
        const nextRoundStore = createNextRoundStore();
        const wrapper = mount(Rounds, {
            global: {
                plugins: [
                    [store, tournamentDataStoreKey],
                    [nextRoundStore, nextRoundStoreKey]
                ]
            }
        });
        const roundEditor = wrapper.getComponent('[data-test="round-editor"]');

        wrapper.getComponent('[data-test="new-7-game-round"]').vm.$emit('click');
        await wrapper.vm.$nextTick();

        expect(roundEditor.props().round).toEqual({
            games: [
                { mode: 'Unknown Mode', stage: 'Unknown Stage' },
                { mode: 'Unknown Mode', stage: 'Unknown Stage' },
                { mode: 'Unknown Mode', stage: 'Unknown Stage' },
                { mode: 'Unknown Mode', stage: 'Unknown Stage' },
                { mode: 'Unknown Mode', stage: 'Unknown Stage' },
                { mode: 'Unknown Mode', stage: 'Unknown Stage' },
                { mode: 'Unknown Mode', stage: 'Unknown Stage' }
            ],
            meta: {
                name: 'New Round',
                type: PlayType.BEST_OF
            }
        });
        expect(roundEditor.props().isNewRound).toEqual(true);
    });

    it('handles round creation being cancelled', async () => {
        const store = createTournamentDataStore();
        const nextRoundStore = createNextRoundStore();
        const wrapper = mount(Rounds, {
            global: {
                plugins: [
                    [store, tournamentDataStoreKey],
                    [nextRoundStore, nextRoundStoreKey]
                ]
            }
        });
        const roundEditor = wrapper.getComponent('[data-test="round-editor"]');

        wrapper.getComponent('[data-test="new-7-game-round"]').vm.$emit('click');
        await wrapper.vm.$nextTick();
        roundEditor.vm.$emit('cancelNewRound');
        await wrapper.vm.$nextTick();

        expect(roundEditor.props().isNewRound).toEqual(false);
    });

    it('handles round being created', async () => {
        const store = createTournamentDataStore();
        const nextRoundStore = createNextRoundStore();
        const wrapper = mount(Rounds, {
            global: {
                plugins: [
                    [store, tournamentDataStoreKey],
                    [nextRoundStore, nextRoundStoreKey]
                ]
            }
        });
        const roundEditor = wrapper.getComponent('[data-test="round-editor"]');

        wrapper.getComponent('[data-test="new-7-game-round"]').vm.$emit('click');
        await wrapper.vm.$nextTick();
        roundEditor.vm.$emit('createNewRound', '0387');
        await wrapper.vm.$nextTick();

        expect(roundEditor.props().isNewRound).toEqual(false);
        expect(roundEditor.props().roundId).toEqual('0387');
        expect(roundEditor.props().round).toEqual({
            meta: { name: 'dope round', type: PlayType.BEST_OF },
            games: []
        });
    });
});
