import ResolvePredictionDialog from '../resolvePredictionDialog.vue';
import { createStore } from 'vuex';
import { PredictionDataStore, predictionDataStoreKey } from '../../store/predictionDataStore';
import { PredictionStatus } from 'types/enums/predictionStatus';
import { config, flushPromises, mount } from '@vue/test-utils';
import { ActiveRoundStore, activeRoundStoreKey } from '../../store/activeRoundStore';
import { GameWinner } from 'types/enums/gameWinner';
import { mockDialog, mockGetDialog } from '../../__mocks__/mockNodecg';

describe('ResolvePredictionDialog', () => {
    config.global.stubs = {
        FontAwesomeIcon: true,
        IplPanelTitle: true
    };

    const mockResolvePrediction = jest.fn();

    function createPredictionDataStore() {
        return createStore<PredictionDataStore>({
            state: {
                predictionStore: {
                    enablePrediction: true,
                    socketOpen: true,
                    currentPrediction: {
                        id: 'prediction123',
                        broadcasterId: 'ipl',
                        broadcasterName: 'IPL',
                        broadcasterLogin: 'eye pee el',
                        title: 'Who will win?',
                        outcomes: [
                            {
                                id: 'outcome-1',
                                title: 'First Team',
                                users: 5,
                                pointsUsed: 10000,
                                topPredictors: [],
                                color: 'BLUE'
                            },
                            {
                                id: 'outcome-2',
                                title: 'Second Team',
                                users: 1,
                                pointsUsed: 1,
                                topPredictors: [],
                                color: 'PINK'
                            }
                        ],
                        duration: 60,
                        status: PredictionStatus.ACTIVE,
                        creationTime: '2020',
                    }
                }
            },
            actions: {
                resolvePrediction: mockResolvePrediction,
            }
        });
    }

    function createActiveRoundStore() {
        return createStore<ActiveRoundStore>({
            state: {
                activeRound: {
                    teamA: {
                        score: 0,
                        id: '123123',
                        name: 'First Team',
                        showLogo: true,
                        players: null,
                        color: null
                    },
                    teamB: {
                        score: 2,
                        id: '345345',
                        name: 'Second Team',
                        showLogo: false,
                        players: null,
                        color: null
                    },
                    activeColor: {
                        categoryName: 'Ranked Modes',
                        index: 0,
                        title: 'coolest color',
                        isCustom: false
                    },
                    round: {
                        id: '0387',
                        name: 'cool round',
                        isCompleted: false
                    },
                    games: [
                        {
                            winner: GameWinner.BRAVO,
                            stage: 'Blackbelly Skatepark',
                            mode: 'Rainmaker',
                            color: {
                                index: 2,
                                title: 'Cool Color',
                                clrA: '#123123',
                                clrB: '#345345',
                                categoryName: 'Cool Colors',
                                isCustom: false,
                                colorsSwapped: false
                            }
                        },
                        {
                            winner: GameWinner.BRAVO,
                            stage: 'MakoMart',
                            mode: 'Tower Control',
                            color: {
                                index: 0,
                                title: 'Cool Color',
                                clrA: '#837693',
                                clrB: '#206739',
                                categoryName: 'Custom Color',
                                isCustom: true,
                                colorsSwapped: true
                            }
                        },
                        {
                            winner: GameWinner.NO_WINNER,
                            stage: 'Camp Triggerfish',
                            mode: 'Splat Zones'
                        },
                    ],
                },
                swapColorsInternally: false
            }
        });
    }

    it('matches snapshot with missing prediction data', () => {
        const predictionDataStore = createPredictionDataStore();
        const activeRoundStore = createActiveRoundStore();
        predictionDataStore.state.predictionStore.currentPrediction = undefined;
        const wrapper = mount(ResolvePredictionDialog, {
            global: {
                plugins: [[predictionDataStore, predictionDataStoreKey], [activeRoundStore, activeRoundStoreKey]]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot when the prediction is not locked', () => {
        const predictionDataStore = createPredictionDataStore();
        const activeRoundStore = createActiveRoundStore();
        predictionDataStore.state.predictionStore.currentPrediction.status = PredictionStatus.RESOLVED;
        const wrapper = mount(ResolvePredictionDialog, {
            global: {
                plugins: [[predictionDataStore, predictionDataStoreKey], [activeRoundStore, activeRoundStoreKey]]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot when the current round is not completed', () => {
        const predictionDataStore = createPredictionDataStore();
        const activeRoundStore = createActiveRoundStore();
        predictionDataStore.state.predictionStore.currentPrediction.status = PredictionStatus.LOCKED;
        activeRoundStore.state.activeRound.round.isCompleted = false;
        const wrapper = mount(ResolvePredictionDialog, {
            global: {
                plugins: [[predictionDataStore, predictionDataStoreKey], [activeRoundStore, activeRoundStoreKey]]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot when the winner name cannot be determined', () => {
        const predictionDataStore = createPredictionDataStore();
        const activeRoundStore = createActiveRoundStore();
        predictionDataStore.state.predictionStore.currentPrediction.status = PredictionStatus.LOCKED;
        activeRoundStore.state.activeRound.teamA.score = 1;
        activeRoundStore.state.activeRound.teamB.score = 1;
        const wrapper = mount(ResolvePredictionDialog, {
            global: {
                plugins: [[predictionDataStore, predictionDataStoreKey], [activeRoundStore, activeRoundStoreKey]]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot when the winner cannot be determined automatically', () => {
        const predictionDataStore = createPredictionDataStore();
        const activeRoundStore = createActiveRoundStore();
        predictionDataStore.state.predictionStore.currentPrediction.status = PredictionStatus.LOCKED;
        activeRoundStore.state.activeRound.teamA.score = 1;
        activeRoundStore.state.activeRound.teamA.name = 'unknown team a';
        activeRoundStore.state.activeRound.teamB.score = 2;
        activeRoundStore.state.activeRound.teamB.name = 'unknown team b';
        const wrapper = mount(ResolvePredictionDialog, {
            global: {
                plugins: [[predictionDataStore, predictionDataStoreKey], [activeRoundStore, activeRoundStoreKey]]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot when the winner is determined as team A', () => {
        const predictionDataStore = createPredictionDataStore();
        const activeRoundStore = createActiveRoundStore();
        predictionDataStore.state.predictionStore.currentPrediction.status = PredictionStatus.LOCKED;
        activeRoundStore.state.activeRound.teamA.score = 2;
        activeRoundStore.state.activeRound.teamB.score = 1;
        const wrapper = mount(ResolvePredictionDialog, {
            global: {
                plugins: [[predictionDataStore, predictionDataStoreKey], [activeRoundStore, activeRoundStoreKey]]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot when the winner is determined as team B', () => {
        const predictionDataStore = createPredictionDataStore();
        const activeRoundStore = createActiveRoundStore();
        predictionDataStore.state.predictionStore.currentPrediction.status = PredictionStatus.LOCKED;
        activeRoundStore.state.activeRound.teamA.score = 1;
        activeRoundStore.state.activeRound.teamB.score = 2;
        const wrapper = mount(ResolvePredictionDialog, {
            global: {
                plugins: [[predictionDataStore, predictionDataStoreKey], [activeRoundStore, activeRoundStoreKey]]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('handles first outcome being resolved and closes dialog when it completes', async () => {
        const predictionDataStore = createPredictionDataStore();
        const activeRoundStore = createActiveRoundStore();
        predictionDataStore.state.predictionStore.currentPrediction.status = PredictionStatus.LOCKED;
        const wrapper = mount(ResolvePredictionDialog, {
            global: {
                plugins: [[predictionDataStore, predictionDataStoreKey], [activeRoundStore, activeRoundStoreKey]]
            }
        });
        mockResolvePrediction.mockResolvedValue({});

        wrapper.getComponent('[data-test="resolve-outcome-1-button"]').vm.$emit('click');
        await flushPromises();

        expect(mockResolvePrediction).toHaveBeenCalledWith(expect.any(Object), { winningOutcomeIndex: 0 });
        expect(mockGetDialog).toHaveBeenCalledWith('resolvePredictionDialog');
        expect(mockDialog.close).toHaveBeenCalledTimes(1);
    });

    it('handles second outcome being resolved and closes dialog when it completes', async () => {
        const predictionDataStore = createPredictionDataStore();
        const activeRoundStore = createActiveRoundStore();
        predictionDataStore.state.predictionStore.currentPrediction.status = PredictionStatus.LOCKED;
        const wrapper = mount(ResolvePredictionDialog, {
            global: {
                plugins: [[predictionDataStore, predictionDataStoreKey], [activeRoundStore, activeRoundStoreKey]]
            }
        });
        mockResolvePrediction.mockResolvedValue({});

        wrapper.getComponent('[data-test="resolve-outcome-2-button"]').vm.$emit('click');
        await flushPromises();

        expect(mockResolvePrediction).toHaveBeenCalledWith(expect.any(Object), { winningOutcomeIndex: 1 });
        expect(mockGetDialog).toHaveBeenCalledWith('resolvePredictionDialog');
        expect(mockDialog.close).toHaveBeenCalledTimes(1);
    });
});
