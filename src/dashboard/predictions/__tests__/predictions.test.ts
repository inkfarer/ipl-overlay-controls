import Predictions from '../predictions.vue';
import { config, mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import { PredictionDataStore, predictionDataStoreKey } from '../../store/predictionDataStore';
import { PredictionStatus } from 'types/enums/predictionStatus';
import { mockDialog, mockGetDialog, mockSendMessage } from '../../__mocks__/mockNodecg';

describe('Predictions', () => {
    const mockLockPrediction = jest.fn();
    const mockCancelPrediction = jest.fn();

    config.global.stubs = {
        PredictionDataDisplay: true,
        IplDataRow: true,
        IplButton: true
    };

    const createPredictionDataStore = () => {
        return createStore<PredictionDataStore>({
            state: {
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
                        creationTime: '2020'
                    }
                }
            },
            actions: {
                lockPrediction: mockLockPrediction,
                cancelPrediction: mockCancelPrediction
            }
        });
    };

    it('shows warning if predictions are not enabled', () => {
        const store = createPredictionDataStore();
        store.state.predictionStore.status.predictionsEnabled = false;
        store.state.predictionStore.currentPrediction = undefined;
        const wrapper = mount(Predictions, {
            global: {
                plugins: [[store, predictionDataStoreKey]]
            }
        });

        expect(wrapper.findComponent('[data-test="no-prediction-data-message"]').exists()).toEqual(false);
        expect(wrapper.findComponent('[data-test="prediction-data-display"]').exists()).toEqual(false);
        expect(wrapper.findComponent('[data-test="prediction-management-space"]').exists()).toEqual(false);
        expect(wrapper.findComponent('[data-test="predictions-disabled-message"]').isVisible()).toEqual(true);
    });

    it('shows message and management space if prediction data is missing', () => {
        const store = createPredictionDataStore();
        store.state.predictionStore.currentPrediction = undefined;
        const wrapper = mount(Predictions, {
            global: {
                plugins: [[store, predictionDataStoreKey]]
            }
        });

        expect(wrapper.findComponent('[data-test="predictions-disabled-message"]').exists()).toEqual(false);
        expect(wrapper.findComponent('[data-test="prediction-data-display"]').exists()).toEqual(false);
        expect(wrapper.findComponent('[data-test="no-prediction-data-message"]').isVisible()).toEqual(true);
        expect(wrapper.findComponent('[data-test="prediction-management-space"]').isVisible()).toEqual(true);
    });

    it('shows prediction data if predictions are enabled and data is present', () => {
        const store = createPredictionDataStore();
        const wrapper = mount(Predictions, {
            global: {
                plugins: [[store, predictionDataStoreKey]]
            }
        });

        expect(wrapper.findComponent('[data-test="no-prediction-data-message"]').exists()).toEqual(false);
        expect(wrapper.findComponent('[data-test="predictions-disabled-message"]').exists()).toEqual(false);
        expect(wrapper.findComponent('[data-test="prediction-data-display"]').isVisible()).toEqual(true);
        expect(wrapper.findComponent('[data-test="prediction-management-space"]').isVisible()).toEqual(true);
    });

    it('shows expected buttons if prediction status is RESOLVED', () => {
        const store = createPredictionDataStore();
        store.state.predictionStore.currentPrediction.status = PredictionStatus.RESOLVED;
        const wrapper = mount(Predictions, {
            global: {
                plugins: [[store, predictionDataStoreKey]]
            }
        });

        expect(wrapper.get('.prediction-button-container').html()).toMatchSnapshot();
    });

    it('shows expected buttons if prediction status is LOCKED', () => {
        const store = createPredictionDataStore();
        store.state.predictionStore.currentPrediction.status = PredictionStatus.LOCKED;
        const wrapper = mount(Predictions, {
            global: {
                plugins: [[store, predictionDataStoreKey]]
            }
        });

        expect(wrapper.get('.prediction-button-container').html()).toMatchSnapshot();
    });

    it('shows expected buttons if prediction status is CANCELED', () => {
        const store = createPredictionDataStore();
        store.state.predictionStore.currentPrediction.status = PredictionStatus.CANCELED;
        const wrapper = mount(Predictions, {
            global: {
                plugins: [[store, predictionDataStoreKey]]
            }
        });

        expect(wrapper.get('.prediction-button-container').html()).toMatchSnapshot();
    });

    it('shows expected buttons if prediction status is ACTIVE', () => {
        const store = createPredictionDataStore();
        store.state.predictionStore.currentPrediction.status = PredictionStatus.ACTIVE;
        const wrapper = mount(Predictions, {
            global: {
                plugins: [[store, predictionDataStoreKey]]
            }
        });

        expect(wrapper.get('.prediction-button-container').html()).toMatchSnapshot();
    });

    it('shows dialog when resolving prediction', () => {
        const store = createPredictionDataStore();
        store.state.predictionStore.currentPrediction.status = PredictionStatus.LOCKED;
        const wrapper = mount(Predictions, {
            global: {
                plugins: [[store, predictionDataStoreKey]]
            }
        });

        wrapper.getComponent('[data-test="resolve-prediction-button"]').vm.$emit('click');

        expect(mockDialog.open).toHaveBeenCalled();
        expect(mockGetDialog).toHaveBeenCalledWith('resolvePredictionDialog');
    });

    it('shows dialog when creating prediction', () => {
        const store = createPredictionDataStore();
        store.state.predictionStore.currentPrediction.status = PredictionStatus.RESOLVED;
        const wrapper = mount(Predictions, {
            global: {
                plugins: [[store, predictionDataStoreKey]]
            }
        });

        wrapper.getComponent('[data-test="create-prediction-button"]').vm.$emit('click');

        expect(mockDialog.open).toHaveBeenCalled();
        expect(mockGetDialog).toHaveBeenCalledWith('createPredictionDialog');
    });

    it('dispatches action when locking prediction', () => {
        const store = createPredictionDataStore();
        store.state.predictionStore.currentPrediction.status = PredictionStatus.ACTIVE;
        const wrapper = mount(Predictions, {
            global: {
                plugins: [[store, predictionDataStoreKey]]
            }
        });

        wrapper.getComponent('[data-test="lock-prediction-button"]').vm.$emit('click');

        expect(mockLockPrediction).toHaveBeenCalled();
    });

    it('dispatches action when cancelling prediction', () => {
        const store = createPredictionDataStore();
        store.state.predictionStore.currentPrediction.status = PredictionStatus.LOCKED;
        const wrapper = mount(Predictions, {
            global: {
                plugins: [[store, predictionDataStoreKey]]
            }
        });

        wrapper.getComponent('[data-test="cancel-prediction-button"]').vm.$emit('click');

        expect(mockCancelPrediction).toHaveBeenCalled();
    });

    it('sends message when showing prediction data', () => {
        const store = createPredictionDataStore();
        store.state.predictionStore.currentPrediction.status = PredictionStatus.LOCKED;
        const wrapper = mount(Predictions, {
            global: {
                plugins: [[store, predictionDataStoreKey]]
            }
        });

        wrapper.getComponent('[data-test="show-prediction-button"]').vm.$emit('click');

        expect(mockSendMessage).toHaveBeenCalledWith('showPredictionData');
    });
});
