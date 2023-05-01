import ResolvePredictionDialog from '../resolvePredictionDialog.vue';
import { PredictionStatus } from 'types/enums/predictionStatus';
import { config, flushPromises, mount } from '@vue/test-utils';
import { useActiveRoundStore } from '../../store/activeRoundStore';
import { GameWinner } from 'types/enums/gameWinner';
import { mockDialog, mockGetDialog } from '../../__mocks__/mockNodecg';
import { closeDialog } from '../../helpers/dialogHelper';
import { PlayType } from 'types/enums/playType';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { usePredictionDataStore } from '../../store/predictionDataStore';
import { IplButton, IplDialogTitle } from '@iplsplatoon/vue-components';

jest.mock('../../helpers/dialogHelper');

describe('ResolvePredictionDialog', () => {
    let pinia: TestingPinia;

    config.global.stubs = {
        FontAwesomeIcon: true,
        IplDialogTitle: true,
        IplErrorDisplay: true
    };

    beforeEach(() => {
        pinia = createTestingPinia();

        useActiveRoundStore().$state = {
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
                    isCustom: false,
                    clrNeutral: '#222'
                },
                match: {
                    id: '01010',
                    name: 'Rad Match',
                    isCompleted: false,
                    type: PlayType.PLAY_ALL
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
                            clrNeutral: '#00FF00',
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
                            clrNeutral: '#00AA00',
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
        };

        usePredictionDataStore().$state = {
            predictionStore: {
                status: {
                    socketOpen: true,
                    predictionsEnabled: true
                },
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
        };
    });

    it('matches snapshot with missing prediction data', () => {
        const predictionDataStore = usePredictionDataStore();
        predictionDataStore.predictionStore.currentPrediction = undefined;
        const wrapper = mount(ResolvePredictionDialog, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot when the prediction is not locked', () => {
        const predictionDataStore = usePredictionDataStore();
        predictionDataStore.predictionStore.currentPrediction.status = PredictionStatus.RESOLVED;
        const wrapper = mount(ResolvePredictionDialog, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot when the current round is not completed', () => {
        const predictionDataStore = usePredictionDataStore();
        const activeRoundStore = useActiveRoundStore();
        predictionDataStore.predictionStore.currentPrediction.status = PredictionStatus.LOCKED;
        activeRoundStore.activeRound.match.isCompleted = false;
        const wrapper = mount(ResolvePredictionDialog, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot when the winner name cannot be determined', () => {
        const predictionDataStore = usePredictionDataStore();
        const activeRoundStore = useActiveRoundStore();
        predictionDataStore.predictionStore.currentPrediction.status = PredictionStatus.LOCKED;
        activeRoundStore.activeRound.teamA.score = 1;
        activeRoundStore.activeRound.teamB.score = 1;
        const wrapper = mount(ResolvePredictionDialog, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot when the winner cannot be determined automatically', () => {
        const predictionDataStore = usePredictionDataStore();
        const activeRoundStore = useActiveRoundStore();
        predictionDataStore.predictionStore.currentPrediction.status = PredictionStatus.LOCKED;
        activeRoundStore.activeRound.teamA.score = 1;
        activeRoundStore.activeRound.teamA.name = 'unknown team a';
        activeRoundStore.activeRound.teamB.score = 2;
        activeRoundStore.activeRound.teamB.name = 'unknown team b';
        const wrapper = mount(ResolvePredictionDialog, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot when the winner is determined as team A', () => {
        const predictionDataStore = usePredictionDataStore();
        const activeRoundStore = useActiveRoundStore();
        predictionDataStore.predictionStore.currentPrediction.status = PredictionStatus.LOCKED;
        activeRoundStore.activeRound.teamA.score = 2;
        activeRoundStore.activeRound.teamB.score = 1;
        const wrapper = mount(ResolvePredictionDialog, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot when the winner is determined as team B', () => {
        const predictionDataStore = usePredictionDataStore();
        const activeRoundStore = useActiveRoundStore();
        predictionDataStore.predictionStore.currentPrediction.status = PredictionStatus.LOCKED;
        activeRoundStore.activeRound.teamA.score = 1;
        activeRoundStore.activeRound.teamB.score = 2;
        const wrapper = mount(ResolvePredictionDialog, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('handles first outcome being resolved and closes dialog when it completes', async () => {
        const predictionDataStore = usePredictionDataStore();
        predictionDataStore.predictionStore.currentPrediction.status = PredictionStatus.LOCKED;
        const wrapper = mount(ResolvePredictionDialog, {
            global: {
                plugins: [pinia]
            }
        });
        predictionDataStore.resolvePrediction = jest.fn().mockResolvedValue({});

        wrapper.getComponent<typeof IplButton>('[data-test="resolve-outcome-1-button"]').vm.$emit('click');
        await flushPromises();

        expect(predictionDataStore.resolvePrediction).toHaveBeenCalledWith({ winningOutcomeIndex: 0 });
        expect(mockGetDialog).toHaveBeenCalledWith('resolvePredictionDialog');
        expect(mockDialog.close).toHaveBeenCalledTimes(1);
    });

    it('handles second outcome being resolved and closes dialog when it completes', async () => {
        const predictionDataStore = usePredictionDataStore();
        predictionDataStore.predictionStore.currentPrediction.status = PredictionStatus.LOCKED;
        const wrapper = mount(ResolvePredictionDialog, {
            global: {
                plugins: [pinia]
            }
        });
        predictionDataStore.resolvePrediction = jest.fn().mockResolvedValue({});

        wrapper.getComponent<typeof IplButton>('[data-test="resolve-outcome-2-button"]').vm.$emit('click');
        await flushPromises();

        expect(predictionDataStore.resolvePrediction).toHaveBeenCalledWith({ winningOutcomeIndex: 1 });
        expect(mockGetDialog).toHaveBeenCalledWith('resolvePredictionDialog');
        expect(mockDialog.close).toHaveBeenCalledTimes(1);
    });

    it('closes dialog on dialog title close event', () => {
        const wrapper = mount(ResolvePredictionDialog, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplDialogTitle>('ipl-dialog-title-stub').vm.$emit('close');

        expect(closeDialog).toHaveBeenCalledWith('resolvePredictionDialog');
    });
});
