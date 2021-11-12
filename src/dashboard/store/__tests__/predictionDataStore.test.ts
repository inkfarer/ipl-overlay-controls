import { predictionDataStore } from '../predictionDataStore';
import { PredictionStatus } from 'types/enums/predictionStatus';
import { mockSendMessage } from '../../__mocks__/mockNodecg';

describe('predictionDataStore', () => {
    beforeEach(() => {
        predictionDataStore.replaceState({
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
                    creationTime: '2020'
                }
            }
        });
    });

    describe('mutations', () => {
        describe('setState', () => {
            it('updates state', () => {
                predictionDataStore.commit('setState', { name: 'predictionStore', val: { foo: 'bar' } });

                expect(predictionDataStore.state.predictionStore).toEqual({ foo: 'bar' });
            });
        });
    });

    describe('actions', () => {
        describe('lockPrediction', () => {
            it('locks prediction', async () => {
                predictionDataStore.state.predictionStore.currentPrediction.status = PredictionStatus.ACTIVE;

                await predictionDataStore.dispatch('lockPrediction');

                expect(mockSendMessage).toHaveBeenCalledWith('patchPrediction', {
                    id: 'prediction123',
                    status: PredictionStatus.LOCKED
                });
            });

            it('throws error if prediction state is not ACTIVE', async () => {
                predictionDataStore.state.predictionStore.currentPrediction.status = PredictionStatus.LOCKED;

                await expect(() => predictionDataStore.dispatch('lockPrediction')).rejects
                    .toThrow('Cannot set prediction status at this time. Status must match one of [ACTIVE]');
                expect(mockSendMessage).not.toHaveBeenCalled();
            });
        });

        describe('cancelPrediction', () => {
            it('cancels prediction', async () => {
                predictionDataStore.state.predictionStore.currentPrediction.status = PredictionStatus.ACTIVE;

                await predictionDataStore.dispatch('cancelPrediction');

                expect(mockSendMessage).toHaveBeenCalledWith('patchPrediction', {
                    id: 'prediction123',
                    status: PredictionStatus.CANCELED
                });
            });

            it('throws error if prediction state is not ACTIVE or LOCKED', async () => {
                predictionDataStore.state.predictionStore.currentPrediction.status = PredictionStatus.RESOLVED;

                await expect(() => predictionDataStore.dispatch('cancelPrediction')).rejects
                    .toThrow('Cannot set prediction status at this time. Status must match one of [ACTIVE, LOCKED]');
                expect(mockSendMessage).not.toHaveBeenCalled();
            });
        });
    });
});
