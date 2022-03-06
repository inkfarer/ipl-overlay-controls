import { PredictionStatus } from 'types/enums/predictionStatus';
import { mockSendMessage } from '../../__mocks__/mockNodecg';
import { createPinia, setActivePinia } from 'pinia';
import { usePredictionDataStore } from '../predictionDataStore';

describe('store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());

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

    describe('actions', () => {
        describe('lockPrediction', () => {
            it('locks prediction', async () => {
                const store = usePredictionDataStore();
                store.predictionStore.currentPrediction.status = PredictionStatus.ACTIVE;

                await store.lockPrediction();

                expect(mockSendMessage).toHaveBeenCalledWith('patchPrediction', {
                    id: 'prediction123',
                    status: PredictionStatus.LOCKED
                });
            });

            it('throws error if prediction state is not ACTIVE', async () => {
                const store = usePredictionDataStore();

                store.predictionStore.currentPrediction.status = PredictionStatus.LOCKED;

                await expect(() => store.lockPrediction()).rejects
                    .toThrow('Cannot set prediction status at this time. Status must match one of [ACTIVE]');
                expect(mockSendMessage).not.toHaveBeenCalled();
            });
        });

        describe('cancelPrediction', () => {
            it('cancels prediction', async () => {
                const store = usePredictionDataStore();

                store.predictionStore.currentPrediction.status = PredictionStatus.ACTIVE;

                await store.cancelPrediction();

                expect(mockSendMessage).toHaveBeenCalledWith('patchPrediction', {
                    id: 'prediction123',
                    status: PredictionStatus.CANCELED
                });
            });

            it('throws error if prediction state is not ACTIVE or LOCKED', async () => {
                const store = usePredictionDataStore();

                store.predictionStore.currentPrediction.status = PredictionStatus.RESOLVED;

                await expect(() => store.cancelPrediction()).rejects
                    .toThrow('Cannot set prediction status at this time. Status must match one of [ACTIVE, LOCKED]');
                expect(mockSendMessage).not.toHaveBeenCalled();
            });
        });

        describe('resolvePrediction', () => {
            it('throws error if index is below 0', async () => {
                const store = usePredictionDataStore();

                await expect(() => store.resolvePrediction({ winningOutcomeIndex: -21 }))
                    .rejects.toThrow('Cannot resolve prediction with outcome index -21');
            });

            it('throws error if index is above 1', async () => {
                const store = usePredictionDataStore();

                await expect(() => store.resolvePrediction({ winningOutcomeIndex: 2 }))
                    .rejects.toThrow('Cannot resolve prediction with outcome index 2');
            });

            it('throws error if prediction data is missing', async () => {
                const store = usePredictionDataStore();
                store.predictionStore.currentPrediction = undefined;

                await expect(() => store.resolvePrediction({ winningOutcomeIndex: 1 }))
                    .rejects.toThrow('No prediction to resolve.');
            });

            it('throws error if prediction is not locked', async () => {
                const store = usePredictionDataStore();
                store.predictionStore.currentPrediction.status = PredictionStatus.ACTIVE;

                await expect(() => store.resolvePrediction({ winningOutcomeIndex: 1 }))
                    .rejects.toThrow('Can only resolve a locked prediction.');
            });

            it('sends message to extension', async () => {
                const store = usePredictionDataStore();
                store.predictionStore.currentPrediction.status = PredictionStatus.LOCKED;

                await store.resolvePrediction({ winningOutcomeIndex: 0 });

                expect(mockSendMessage).toHaveBeenCalledWith('patchPrediction', {
                    id: 'prediction123',
                    status: PredictionStatus.RESOLVED,
                    winning_outcome_id: 'outcome-1'
                });
            });
        });

        describe('createPrediction', () => {
            it('throws error if current prediction is active', async () => {
                const store = usePredictionDataStore();
                store.predictionStore.currentPrediction.status = PredictionStatus.ACTIVE;

                await expect(
                    () => store.createPrediction(
                        { title: 'Who will win?', teamAName: 'Team A', teamBName: 'Team B', duration: 120 })
                ).rejects.toThrow('An unresolved prediction already exists.');
            });

            it('throws error if current prediction is locked', async () => {
                const store = usePredictionDataStore();
                store.predictionStore.currentPrediction.status = PredictionStatus.LOCKED;

                await expect(
                    () => store.createPrediction(
                        { title: 'Who will win?', teamAName: 'Team A', teamBName: 'Team B', duration: 120 })
                ).rejects.toThrow('An unresolved prediction already exists.');
            });

            it('creates new prediction', async () => {
                const store = usePredictionDataStore();
                store.predictionStore.currentPrediction.status = PredictionStatus.RESOLVED;

                await store.createPrediction(
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
                const store = usePredictionDataStore();

                store.reconnect();

                expect(mockSendMessage).toHaveBeenCalledWith('reconnectToRadiaSocket');
            });
        });
    });
});
