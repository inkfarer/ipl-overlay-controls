import PredictionDataDisplay from '../predictionDataDisplay.vue';
import { usePredictionDataStore } from '../../../store/predictionDataStore';
import { config, mount } from '@vue/test-utils';
import { PredictionStatus } from 'types/enums/predictionStatus';
import { DateTime } from 'luxon';
import { createTestingPinia, TestingPinia } from '@pinia/testing';

describe('PredictionDataDisplay', () => {
    let pinia: TestingPinia;

    config.global.stubs = {
        FontAwesomeIcon: true,
        IplProgressBar: true
    };

    beforeEach(() => {
        pinia = createTestingPinia();

        usePredictionDataStore().$state = {
            predictionStore: {
                status: {
                    socketOpen: true,
                    predictionsEnabled: true
                }
            }
        };
    });

    it('matches snapshot', () => {
        const store = usePredictionDataStore();
        store.predictionStore.currentPrediction = {
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
            creationTime: '2020'
        };
        const wrapper = mount(PredictionDataDisplay, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot with newly started prediction', () => {
        const store = usePredictionDataStore();
        store.predictionStore.currentPrediction = {
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
                    pointsUsed: null,
                    topPredictors: [],
                    color: 'BLUE'
                },
                {
                    id: 'outcome-2',
                    title: 'Second Team',
                    users: 1,
                    pointsUsed: null,
                    topPredictors: [],
                    color: 'PINK'
                }
            ],
            duration: 60,
            status: PredictionStatus.ACTIVE,
            creationTime: '2020'
        };
        const wrapper = mount(PredictionDataDisplay, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot with winner', () => {
        const store = usePredictionDataStore();
        store.predictionStore.currentPrediction = {
            id: 'prediction123',
            broadcasterId: 'ipl',
            broadcasterName: 'IPL',
            broadcasterLogin: 'eye pee el',
            title: 'Who will win?',
            winningOutcome: 'outcome-2',
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
                    users: 20,
                    pointsUsed: 45879,
                    topPredictors: [],
                    color: 'PINK'
                }
            ],
            duration: 60,
            status: PredictionStatus.ACTIVE,
            creationTime: '2020'
        };
        const wrapper = mount(PredictionDataDisplay, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot with timer', () => {
        jest.spyOn(window, 'setInterval').mockImplementation((callback) => {
            (callback as () => void)();
            // In the browser, setInterval returns a number.
            return 0;
        });
        const store = usePredictionDataStore();
        store.predictionStore.currentPrediction = {
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
            lockTime: DateTime.now().plus({ seconds: 100 }).toISO()
        };
        const wrapper = mount(PredictionDataDisplay, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });
});
