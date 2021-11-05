import ScoreDisplay from '../scoreDisplay.vue';
import { createStore } from 'vuex';
import { ActiveRoundStore, activeRoundStoreKey } from '../../activeRoundStore';
import { config, mount } from '@vue/test-utils';
import { GameWinner } from 'types/enums/gameWinner';

describe('ScoreDisplay', () => {
    const mockSetWinner = jest.fn();
    const mockRemoveWinner = jest.fn();

    config.global.stubs = {
        IplButton: true
    };

    function createActiveRoundStore() {
        return createStore<ActiveRoundStore>({
            state: {
                activeRound: {
                    teamA: {
                        score: 0,
                        id: null,
                        name: null,
                        showLogo: null,
                        players: null,
                        color: null
                    },
                    teamB: {
                        score: 2,
                        id: null,
                        name: null,
                        showLogo: null,
                        players: null,
                        color: null
                    },
                    activeColor: null,
                    round: null,
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
                setWinner: mockSetWinner,
                removeWinner: mockRemoveWinner
            }
        });
    }

    it('matches snapshot', () => {
        const store = createActiveRoundStore();
        const wrapper = mount(ScoreDisplay, {
            global: {
                plugins: [[store, activeRoundStoreKey]]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('disables adding score if last game in round has been completed', () => {
        const store = createActiveRoundStore();
        store.state.activeRound.teamA.score = 1;
        store.state.activeRound.teamB.score = 2;
        const wrapper = mount(ScoreDisplay, {
            global: {
                plugins: [[store, activeRoundStoreKey]]
            }
        });

        expect(wrapper.getComponent('[data-test="team-a-plus-btn"]').attributes().disabled).toEqual('true');
        expect(wrapper.getComponent('[data-test="team-b-plus-btn"]').attributes().disabled).toEqual('true');
    });

    it('disables removing team A score if last game was won by team B', () => {
        const store = createActiveRoundStore();
        store.state.activeRound.games = [
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
            {
                winner: GameWinner.NO_WINNER,
                stage: null,
                mode: null
            },
        ];
        const wrapper = mount(ScoreDisplay, {
            global: {
                plugins: [[store, activeRoundStoreKey]]
            }
        });

        expect(wrapper.getComponent('[data-test="team-a-minus-btn"]').attributes().disabled).toEqual('true');
        expect(wrapper.getComponent('[data-test="team-b-minus-btn"]').attributes().disabled).toEqual('false');
    });

    it('disables removing team B score if last game was won by team A', () => {
        const store = createActiveRoundStore();
        store.state.activeRound.games = [
            {
                winner: GameWinner.BRAVO,
                stage: null,
                mode: null
            },
            {
                winner: GameWinner.ALPHA,
                stage: null,
                mode: null
            },
            {
                winner: GameWinner.NO_WINNER,
                stage: null,
                mode: null
            },
        ];
        const wrapper = mount(ScoreDisplay, {
            global: {
                plugins: [[store, activeRoundStoreKey]]
            }
        });

        expect(wrapper.getComponent('[data-test="team-a-minus-btn"]').attributes().disabled).toEqual('false');
        expect(wrapper.getComponent('[data-test="team-b-minus-btn"]').attributes().disabled).toEqual('true');
    });

    it('disables removing score if round has no completed games', () => {
        const store = createActiveRoundStore();
        store.state.activeRound.games = [
            {
                winner: GameWinner.NO_WINNER,
                stage: null,
                mode: null
            },
            {
                winner: GameWinner.NO_WINNER,
                stage: null,
                mode: null
            },
            {
                winner: GameWinner.NO_WINNER,
                stage: null,
                mode: null
            },
        ];
        const wrapper = mount(ScoreDisplay, {
            global: {
                plugins: [[store, activeRoundStoreKey]]
            }
        });

        expect(wrapper.getComponent('[data-test="team-a-minus-btn"]').attributes().disabled).toEqual('true');
        expect(wrapper.getComponent('[data-test="team-b-minus-btn"]').attributes().disabled).toEqual('true');
    });

    it('sends message to store when adding points to team A', () => {
        const store = createActiveRoundStore();
        const wrapper = mount(ScoreDisplay, {
            global: {
                plugins: [[store, activeRoundStoreKey]]
            }
        });

        wrapper.getComponent('[data-test="team-a-plus-btn"]').vm.$emit('click');

        expect(mockSetWinner).toHaveBeenCalledWith(expect.any(Object), { winner: GameWinner.ALPHA });
    });

    it('sends message to store when adding points to team B', () => {
        const store = createActiveRoundStore();
        const wrapper = mount(ScoreDisplay, {
            global: {
                plugins: [[store, activeRoundStoreKey]]
            }
        });

        wrapper.getComponent('[data-test="team-b-plus-btn"]').vm.$emit('click');

        expect(mockSetWinner).toHaveBeenCalledWith(expect.any(Object), { winner: GameWinner.BRAVO });
    });

    it('sends message to store when removing points from team A', () => {
        const store = createActiveRoundStore();
        const wrapper = mount(ScoreDisplay, {
            global: {
                plugins: [[store, activeRoundStoreKey]]
            }
        });

        wrapper.getComponent('[data-test="team-a-minus-btn"]').vm.$emit('click');

        expect(mockRemoveWinner).toHaveBeenCalled();
    });

    it('sends message to store when removing points from team B', () => {
        const store = createActiveRoundStore();
        const wrapper = mount(ScoreDisplay, {
            global: {
                plugins: [[store, activeRoundStoreKey]]
            }
        });

        wrapper.getComponent('[data-test="team-b-minus-btn"]').vm.$emit('click');

        expect(mockRemoveWinner).toHaveBeenCalled();
    });
});
