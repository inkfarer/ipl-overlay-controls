import ScoreDisplay from '../scoreDisplay.vue';
import { useActiveRoundStore } from '../../../store/activeRoundStore';
import { config, mount } from '@vue/test-utils';
import { GameWinner } from 'types/enums/gameWinner';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { IplButton } from '@iplsplatoon/vue-components';

describe('ScoreDisplay', () => {
    let pinia: TestingPinia;

    beforeEach(() => {
        pinia = createTestingPinia();

        useActiveRoundStore().$state = {
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
                match: null,
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
        };
    });

    config.global.stubs = {
        IplButton: true
    };

    it('matches snapshot', () => {
        const wrapper = mount(ScoreDisplay, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('disables adding score if last game in round has been completed', () => {
        const store = useActiveRoundStore();
        store.activeRound.teamA.score = 1;
        store.activeRound.teamB.score = 2;
        const wrapper = mount(ScoreDisplay, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.getComponent('[data-test="team-a-plus-btn"]').attributes().disabled).toEqual('true');
        expect(wrapper.getComponent('[data-test="team-b-plus-btn"]').attributes().disabled).toEqual('true');
    });

    it('disables removing team A score if last game was won by team B', () => {
        const store = useActiveRoundStore();
        store.activeRound.games = [
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
                plugins: [pinia]
            }
        });

        expect(wrapper.getComponent('[data-test="team-a-minus-btn"]').attributes().disabled).toEqual('true');
        expect(wrapper.getComponent('[data-test="team-b-minus-btn"]').attributes().disabled).toEqual('false');
    });

    it('disables removing team B score if last game was won by team A', () => {
        const store = useActiveRoundStore();
        store.activeRound.games = [
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
                plugins: [pinia]
            }
        });

        expect(wrapper.getComponent('[data-test="team-a-minus-btn"]').attributes().disabled).toEqual('false');
        expect(wrapper.getComponent('[data-test="team-b-minus-btn"]').attributes().disabled).toEqual('true');
    });

    it('disables removing score if round has no completed games', () => {
        const store = useActiveRoundStore();
        store.activeRound.games = [
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
                plugins: [pinia]
            }
        });

        expect(wrapper.getComponent('[data-test="team-a-minus-btn"]').attributes().disabled).toEqual('true');
        expect(wrapper.getComponent('[data-test="team-b-minus-btn"]').attributes().disabled).toEqual('true');
    });

    it('sends message to store when adding points to team A', () => {
        const store = useActiveRoundStore();
        store.setWinner = jest.fn();
        const wrapper = mount(ScoreDisplay, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplButton>('[data-test="team-a-plus-btn"]').vm.$emit('click');

        expect(store.setWinner).toHaveBeenCalledWith({ winner: GameWinner.ALPHA });
    });

    it('sends message to store when adding points to team B', () => {
        const store = useActiveRoundStore();
        store.setWinner = jest.fn();
        const wrapper = mount(ScoreDisplay, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplButton>('[data-test="team-b-plus-btn"]').vm.$emit('click');

        expect(store.setWinner).toHaveBeenCalledWith({ winner: GameWinner.BRAVO });
    });

    it('sends message to store when removing points from team A', () => {
        const store = useActiveRoundStore();
        store.removeWinner = jest.fn();
        const wrapper = mount(ScoreDisplay, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplButton>('[data-test="team-a-minus-btn"]').vm.$emit('click');

        expect(store.removeWinner).toHaveBeenCalled();
    });

    it('sends message to store when removing points from team B', () => {
        const store = useActiveRoundStore();
        store.removeWinner = jest.fn();
        const wrapper = mount(ScoreDisplay, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplButton>('[data-test="team-b-minus-btn"]').vm.$emit('click');

        expect(store.removeWinner).toHaveBeenCalled();
    });
});
