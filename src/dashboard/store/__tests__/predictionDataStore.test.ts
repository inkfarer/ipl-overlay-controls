import { predictionDataStore } from '../predictionDataStore';
import { PredictionStatus } from 'types/enums/predictionStatus';
import { mockSendMessage } from '../../__mocks__/mockNodecg';

describe('predictionDataStore', () => {
    beforeEach(() => {
        predictionDataStore.replaceState({
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

        describe('resolvePrediction', () => {
            it('throws error if index is below 0', async () => {
                await expect(() => predictionDataStore.dispatch('resolvePrediction', { winningOutcomeIndex: -21 }))
                    .rejects.toThrow('Cannot resolve prediction with outcome index -21');
            });

            it('throws error if index is above 1', async () => {
                await expect(() => predictionDataStore.dispatch('resolvePrediction', { winningOutcomeIndex: 2 }))
                    .rejects.toThrow('Cannot resolve prediction with outcome index 2');
            });

            it('throws error if prediction data is missing', async () => {
                predictionDataStore.state.predictionStore.currentPrediction = undefined;

                await expect(() => predictionDataStore.dispatch('resolvePrediction', { winningOutcomeIndex: 1 }))
                    .rejects.toThrow('No prediction to resolve.');
            });

            it('throws error if prediction is not locked', async () => {
                predictionDataStore.state.predictionStore.currentPrediction.status = PredictionStatus.ACTIVE;

                await expect(() => predictionDataStore.dispatch('resolvePrediction', { winningOutcomeIndex: 1 }))
                    .rejects.toThrow('Can only resolve a locked prediction.');
            });

            it('sends message to extension', async () => {
                predictionDataStore.state.predictionStore.currentPrediction.status = PredictionStatus.LOCKED;

                await predictionDataStore.dispatch('resolvePrediction', { winningOutcomeIndex: 0 });

                expect(mockSendMessage).toHaveBeenCalledWith('patchPrediction', {
                    id: 'prediction123',
                    status: PredictionStatus.RESOLVED,
                    winning_outcome_id: 'outcome-1'
                });
            });
        });

        describe('createPrediction', () => {
            it('throws error if current prediction is active', async () => {
                predictionDataStore.state.predictionStore.currentPrediction.status = PredictionStatus.ACTIVE;

                await expect(
                    () => predictionDataStore.dispatch(
                        'createPrediction',
                        { title: 'Who will win?', teamAName: 'Team A', teamBName: 'Team B', duration: 120 })
                ).rejects.toThrow('An unresolved prediction already exists.');
            });

            it('throws error if current prediction is locked', async () => {
                predictionDataStore.state.predictionStore.currentPrediction.status = PredictionStatus.LOCKED;

                await expect(
                    () => predictionDataStore.dispatch(
                        'createPrediction',
                        { title: 'Who will win?', teamAName: 'Team A', teamBName: 'Team B', duration: 120 })
                ).rejects.toThrow('An unresolved prediction already exists.');
            });

            it('creates new prediction', async () => {
                predictionDataStore.state.predictionStore.currentPrediction.status = PredictionStatus.RESOLVED;

                await predictionDataStore.dispatch(
                    'createPrediction',
                    { title: 'Who will win?', teamAName: 'Team A', teamBName: 'Team B', duration: 120 });

                expect(mockSendMessage).toHaveBeenCalledWith('postPrediction', {
                    title: 'Who will win?',
                    outcomes: [
                        { title: 'Team A' },
                        { title: 'Team B' }
                    ],
                    prediction_window: 120
                });
            });
        });

        describe('reconnect', () => {
            it('sends message', () => {
                predictionDataStore.dispatch('reconnect');

                expect(mockSendMessage).toHaveBeenCalledWith('reconnectToRadiaSocket');
            });
        });
    });
});
