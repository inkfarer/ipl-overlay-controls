import Predictions from '../predictions.vue';
import { config, mount } from '@vue/test-utils';
import { PredictionStatus } from 'types/enums/predictionStatus';
import { mockDialog, mockGetDialog, mockSendMessage } from '../../__mocks__/mockNodecg';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { usePredictionDataStore } from '../../store/predictionDataStore';

describe('Predictions', () => {
    let pinia: TestingPinia;

    config.global.stubs = {
        PredictionDataDisplay: true,
        IplDataRow: true,
        IplButton: true,
        IplErrorDisplay: true
    };

    beforeEach(() => {
        pinia = createTestingPinia();

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
                    creationTime: '2020'
                }
            }
        };
    });

    it('shows warning if predictions are not enabled', () => {
        const store = usePredictionDataStore();
        store.predictionStore.status.predictionsEnabled = false;
        store.predictionStore.status.predictionStatusReason = 'Predictions are disabled!';
        store.predictionStore.currentPrediction = undefined;
        const wrapper = mount(Predictions, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.findComponent('[data-test="no-prediction-data-message"]').exists()).toEqual(false);
        expect(wrapper.findComponent('[data-test="prediction-data-display"]').exists()).toEqual(false);
        expect(wrapper.findComponent('[data-test="prediction-management-space"]').exists()).toEqual(false);
        expect(wrapper.findComponent('[data-test="socket-closed-message"]').exists()).toEqual(false);
        expect(wrapper.findComponent('[data-test="socket-reconnect-button"]').exists()).toEqual(false);
        const predictionsDisabledMessage = wrapper.findComponent('[data-test="predictions-disabled-message"]');
        expect(predictionsDisabledMessage.isVisible()).toEqual(true);
        expect(predictionsDisabledMessage.text()).toEqual('Predictions are disabled!');
    });

    it('shows message and management space if prediction data is missing', () => {
        const store = usePredictionDataStore();
        store.predictionStore.currentPrediction = undefined;
        const wrapper = mount(Predictions, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.findComponent('[data-test="predictions-disabled-message"]').exists()).toEqual(false);
        expect(wrapper.findComponent('[data-test="socket-closed-message"]').exists()).toEqual(false);
        expect(wrapper.findComponent('[data-test="socket-reconnect-button"]').exists()).toEqual(false);
        expect(wrapper.findComponent('[data-test="prediction-data-display"]').exists()).toEqual(false);
        expect(wrapper.findComponent('[data-test="no-prediction-data-message"]').isVisible()).toEqual(true);
        expect(wrapper.findComponent('[data-test="prediction-management-space"]').isVisible()).toEqual(true);
    });

    it('shows prediction data if predictions are enabled and data is present', () => {
        const wrapper = mount(Predictions, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.findComponent('[data-test="no-prediction-data-message"]').exists()).toEqual(false);
        expect(wrapper.findComponent('[data-test="socket-closed-message"]').exists()).toEqual(false);
        expect(wrapper.findComponent('[data-test="socket-reconnect-button"]').exists()).toEqual(false);
        expect(wrapper.findComponent('[data-test="predictions-disabled-message"]').exists()).toEqual(false);
        expect(wrapper.findComponent('[data-test="prediction-data-display"]').isVisible()).toEqual(true);
        expect(wrapper.findComponent('[data-test="prediction-management-space"]').isVisible()).toEqual(true);
    });

    it('shows message if websocket is closed', () => {
        const store = usePredictionDataStore();
        store.predictionStore.status.socketOpen = false;
        const wrapper = mount(Predictions, {
            global: {
                plugins: [pinia]
            }
        });

        const message = wrapper.findComponent('[data-test="socket-closed-message"]');
        expect(message.exists()).toEqual(true);
        expect(message.isVisible()).toEqual(true);
        const reconnectButton = wrapper.findComponent('[data-test="socket-reconnect-button"]');
        expect(reconnectButton.exists()).toEqual(true);
        expect(reconnectButton.isVisible()).toEqual(true);
    });

    it('dispatches to store on reconnect', () => {
        const store = usePredictionDataStore();
        store.predictionStore.status.socketOpen = false;
        store.reconnect = jest.fn();
        const wrapper = mount(Predictions, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent('[data-test="socket-reconnect-button"]').vm.$emit('click');

        expect(store.reconnect).toHaveBeenCalled();
    });

    it('shows expected buttons if prediction status is RESOLVED', () => {
        const store = usePredictionDataStore();
        store.predictionStore.currentPrediction.status = PredictionStatus.RESOLVED;
        const wrapper = mount(Predictions, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.get('.prediction-button-container').html()).toMatchSnapshot();
    });

    it('shows expected buttons if prediction status is LOCKED', () => {
        const store = usePredictionDataStore();
        store.predictionStore.currentPrediction.status = PredictionStatus.LOCKED;
        const wrapper = mount(Predictions, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.get('.prediction-button-container').html()).toMatchSnapshot();
    });

    it('shows expected buttons if prediction status is CANCELED', () => {
        const store = usePredictionDataStore();
        store.predictionStore.currentPrediction.status = PredictionStatus.CANCELED;
        const wrapper = mount(Predictions, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.get('.prediction-button-container').html()).toMatchSnapshot();
    });

    it('shows expected buttons if prediction status is ACTIVE', () => {
        const store = usePredictionDataStore();
        store.predictionStore.currentPrediction.status = PredictionStatus.ACTIVE;
        const wrapper = mount(Predictions, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.get('.prediction-button-container').html()).toMatchSnapshot();
    });

    it('shows dialog when resolving prediction', () => {
        const store = usePredictionDataStore();
        store.predictionStore.currentPrediction.status = PredictionStatus.LOCKED;
        const wrapper = mount(Predictions, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent('[data-test="resolve-prediction-button"]').vm.$emit('click');

        expect(mockDialog.open).toHaveBeenCalled();
        expect(mockGetDialog).toHaveBeenCalledWith('resolvePredictionDialog');
    });

    it('shows dialog when creating prediction', () => {
        const store = usePredictionDataStore();
        store.predictionStore.currentPrediction.status = PredictionStatus.RESOLVED;
        const wrapper = mount(Predictions, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent('[data-test="create-prediction-button"]').vm.$emit('click');

        expect(mockDialog.open).toHaveBeenCalled();
        expect(mockGetDialog).toHaveBeenCalledWith('createPredictionDialog');
    });

    it('dispatches action when locking prediction', () => {
        const store = usePredictionDataStore();
        store.lockPrediction = jest.fn();
        store.predictionStore.currentPrediction.status = PredictionStatus.ACTIVE;
        const wrapper = mount(Predictions, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent('[data-test="lock-prediction-button"]').vm.$emit('click');

        expect(store.lockPrediction).toHaveBeenCalled();
    });

    it('dispatches action when cancelling prediction', () => {
        const store = usePredictionDataStore();
        store.cancelPrediction = jest.fn();
        store.predictionStore.currentPrediction.status = PredictionStatus.LOCKED;
        const wrapper = mount(Predictions, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent('[data-test="cancel-prediction-button"]').vm.$emit('click');

        expect(store.cancelPrediction).toHaveBeenCalled();
    });

    it('sends message when showing prediction data', () => {
        const store = usePredictionDataStore();
        store.predictionStore.currentPrediction.status = PredictionStatus.LOCKED;
        const wrapper = mount(Predictions, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent('[data-test="show-prediction-button"]').vm.$emit('click');

        expect(mockSendMessage).toHaveBeenCalledWith('showPredictionData');
    });
});
