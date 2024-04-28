import { PredictionStatus } from 'types/enums/predictionStatus';
import { mockSendMessage } from '../../__mocks__/mockNodecg';
import { createPinia, setActivePinia } from 'pinia';
import { usePredictionDataStore } from '../predictionDataStore';

describe('predictionDataStore', () => {
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

                await store.lockPrediction();

                expect(mockSendMessage).toHaveBeenCalledWith('patchPrediction', {
                    status: PredictionStatus.LOCKED
                });
            });
        });

        describe('cancelPrediction', () => {
            it('cancels prediction', async () => {
                const store = usePredictionDataStore();

                await store.cancelPrediction();

                expect(mockSendMessage).toHaveBeenCalledWith('patchPrediction', {
                    status: PredictionStatus.CANCELED
                });
            });
        });

        describe('resolvePrediction', () => {
            it('throws error if index is below 0', async () => {
                const store = usePredictionDataStore();

                await expect(() => store.resolvePrediction({ winningOutcomeIndex: -21 }))
                    .rejects.toThrow('Cannot resolve prediction with outcome index -21. This is a bug!');
            });

            it('throws error if index is above 1', async () => {
                const store = usePredictionDataStore();

                await expect(() => store.resolvePrediction({ winningOutcomeIndex: 2 }))
                    .rejects.toThrow('Cannot resolve prediction with outcome index 2. This is a bug!');
            });

            it('sends message to extension', async () => {
                const store = usePredictionDataStore();

                await store.resolvePrediction({ winningOutcomeIndex: 0 });

                expect(mockSendMessage).toHaveBeenCalledWith('patchPrediction', {
                    status: PredictionStatus.RESOLVED,
                    winning_outcome_id: 'outcome-1'
                });
            });
        });

        describe('createPrediction', () => {
            it('creates new prediction', async () => {
                const store = usePredictionDataStore();

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
