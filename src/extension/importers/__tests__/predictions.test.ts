import { MockNodecg } from '../../__mocks__/mockNodecg';
import { PredictionStore } from 'schemas';

describe('predictions', () => {
    const mockHasPredictionSupport = jest.fn();
    const mockGetPredictions = jest.fn();
    const mockCreatePrediction = jest.fn();
    const mockUpdatePrediction = jest.fn();
    const mockPredictionDataMapper = class {
        static fromApiResponse = jest.fn();
        static fromBeginEvent = jest.fn();
        static fromProgressEvent = jest.fn();
        static fromLockEvent = jest.fn();
        static applyEndEvent = jest.fn();
    };
    const mockSocketOn = jest.fn();
    const mockWebSocket = jest.fn().mockReturnValue({ on: mockSocketOn });
    let nodecg: MockNodecg;

    jest.mock('ws', () => ({
        __esModule: true,
        default: mockWebSocket
    }));

    jest.mock('../mappers/predictionDataMapper', () => ({
        PredictionDataMapper: mockPredictionDataMapper
    }));

    jest.mock('../clients/radiaClient', () => ({
        __esModule: true,
        hasPredictionSupport: mockHasPredictionSupport,
        getPredictions: mockGetPredictions,
        createPrediction: mockCreatePrediction,
        updatePrediction: mockUpdatePrediction
    }));

    const defaultBundleConfig = {
        radia: {
            url: 'radia://api',
            socketUrl: 'ws://radia/api',
            authentication: 'radia_auth'
        }
    };

    const setup = (bundleConfig: { [key: string]: unknown } = defaultBundleConfig): void => {
        nodecg = new MockNodecg(bundleConfig);
        nodecg.init();

        require('../predictions');
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetModules();
    });

    describe('radiaSettings', () => {
        describe('with bundle config', () => {
            beforeEach(() => {
                setup();
                nodecg.replicants.predictionStore.value = {
                    status: {
                        predictionsEnabled: null,
                        socketOpen: false
                    },
                    currentPrediction: null,
                    modificationTime: '2021-09-10T13:52:29'
                };
            });

            it('sets replicant data if predictions are not supported', async () => {
                mockHasPredictionSupport.mockResolvedValue(false);

                await nodecg.replicantListeners.radiaSettings({ guildID: '104928194082103' });

                expect(mockHasPredictionSupport).toHaveBeenCalledWith('104928194082103');
                expect(nodecg.replicants.predictionStore.value).toEqual({
                    status: {
                        predictionsEnabled: false,
                        socketOpen: false,
                    },
                    currentPrediction: null,
                    modificationTime: '2021-09-10T13:52:29'
                });
            });

            it('does nothing if guild ID is empty', async () => {
                mockHasPredictionSupport.mockResolvedValue(false);

                await nodecg.replicantListeners.radiaSettings({ guildID: '' });

                expect(nodecg.log.warn).toHaveBeenCalledWith('Radia guild ID is not configured!');
                expect(mockHasPredictionSupport).not.toHaveBeenCalled();
                expect(mockWebSocket).not.toHaveBeenCalled();
            });

            it('sets replicant data if predictions are supported', async () => {
                mockHasPredictionSupport.mockResolvedValue(true);

                await nodecg.replicantListeners.radiaSettings({ guildID: '142235235' });

                expect(mockHasPredictionSupport).toHaveBeenCalledWith('142235235');
                expect(nodecg.replicants.predictionStore.value).toEqual({
                    status: {
                        socketOpen: false,
                        predictionsEnabled: true,
                    },
                    currentPrediction: null,
                    modificationTime: '2021-09-10T13:52:29'
                });
            });

            it('fetches prediction data if supported', async () => {
                mockHasPredictionSupport.mockResolvedValue(true);
                const expectedPrediction = { id: 'FIRST-PREDICTION', outcomes: [{}]};
                mockGetPredictions.mockResolvedValue([
                    expectedPrediction,
                    { id: 'SECOND-PREDICTION', outcomes: []}
                ]);
                mockPredictionDataMapper.fromApiResponse.mockReturnValue(expectedPrediction);

                await nodecg.replicantListeners.radiaSettings({ guildID: '142235235' });

                expect((nodecg.replicants.predictionStore.value as PredictionStore).currentPrediction)
                    .toEqual({ id: 'FIRST-PREDICTION', outcomes: [{}]});
            });

            describe('socket', () => {
                beforeEach(async () => {
                    mockHasPredictionSupport.mockResolvedValue(true);
                    mockGetPredictions.mockResolvedValue([]);
                    mockPredictionDataMapper.fromApiResponse.mockReturnValue(null);
                    await nodecg.replicantListeners.radiaSettings({ guildID: '1422352354' });
                });

                it('starts websocket', async () => {
                    expect(mockWebSocket).toHaveBeenCalledWith('ws://radia/api/events/guild/1422352354', {
                        headers: { Authorization: 'radia_auth' }
                    });
                    expect(mockSocketOn).toHaveBeenCalledTimes(4);
                });

                it('handles socket opening', () => {
                    const openCallback = mockSocketOn.mock.calls.find(call => call[0] === 'open')[1];
                    const predictionStoreValue = nodecg.replicants.predictionStore.value as PredictionStore;
                    predictionStoreValue.status.socketOpen = false;

                    openCallback();

                    expect(predictionStoreValue.status.socketOpen).toEqual(true);
                });

                it('handles socket closing', () => {
                    const closeCallback = mockSocketOn.mock.calls.find(call => call[0] === 'close')[1];
                    const predictionStoreValue = nodecg.replicants.predictionStore.value as PredictionStore;
                    predictionStoreValue.status.socketOpen = true;

                    closeCallback();

                    expect(predictionStoreValue.status.socketOpen).toEqual(false);
                });

                it('handles socket errors', () => {
                    const errorCallback = mockSocketOn.mock.calls.find(call => call[0] === 'error')[1];
                    const predictionStoreValue = nodecg.replicants.predictionStore.value as PredictionStore;
                    predictionStoreValue.status.socketOpen = true;

                    errorCallback({
                        code: '12345',
                        message: 'Error!'
                    });

                    expect(nodecg.log.error).toHaveBeenCalledWith('Received error from Radia websocket. Code: 12345, Message: Error!');
                });

                it('handles unknown socket message', () => {
                    const messageCallback = mockSocketOn.mock.calls.find(call => call[0] === 'message')[1];

                    messageCallback(JSON.stringify({ subscription: { type: 'something' } }));

                    expect((nodecg.replicants.predictionStore.value as PredictionStore).currentPrediction).toBeNull();
                });

                it('ignores messages with old timestamps', () => {
                    const messageCallback = mockSocketOn.mock.calls.find(call => call[0] === 'message')[1];

                    messageCallback(JSON.stringify({
                        subscription: {
                            type: 'channel.prediction.begin'
                        }, timestamp: '2021-09-10T13:52:28'
                    }));

                    expect((nodecg.replicants.predictionStore.value as PredictionStore).currentPrediction).toBeNull();
                });

                it('handles begin event', () => {
                    const event = { foo: 'bar' };
                    const messageCallback = mockSocketOn.mock.calls.find(call => call[0] === 'message')[1];
                    mockPredictionDataMapper.fromBeginEvent.mockReturnValue({ id: '1234567' });

                    messageCallback(JSON.stringify({
                        subscription: { type: 'channel.prediction.begin' },
                        event,
                        timestamp: '2021-09-10T13:52:30'
                    }));

                    const predictionStore = nodecg.replicants.predictionStore.value as PredictionStore;
                    expect(predictionStore.currentPrediction).toEqual({ id: '1234567' });
                    expect(predictionStore.modificationTime).toEqual('2021-09-10T13:52:30');
                    expect(mockPredictionDataMapper.fromBeginEvent).toHaveBeenCalledWith(event);
                });

                it('handles progress event', () => {
                    const event = { foo: 'bar' };
                    const messageCallback = mockSocketOn.mock.calls.find(call => call[0] === 'message')[1];
                    mockPredictionDataMapper.fromProgressEvent.mockReturnValue({ id: '1234567' });

                    messageCallback(JSON.stringify({
                        subscription: { type: 'channel.prediction.progress' },
                        event,
                        timestamp: '2021-09-10T13:52:31'
                    }));

                    const predictionStore = nodecg.replicants.predictionStore.value as PredictionStore;
                    expect(predictionStore.currentPrediction).toEqual({ id: '1234567' });
                    expect(predictionStore.modificationTime).toEqual('2021-09-10T13:52:31');
                    expect(mockPredictionDataMapper.fromProgressEvent).toHaveBeenCalledWith(event);
                });

                it('handles lock event', () => {
                    const event = { foo: 'bar' };
                    const messageCallback = mockSocketOn.mock.calls.find(call => call[0] === 'message')[1];
                    mockPredictionDataMapper.fromLockEvent.mockReturnValue({ id: '12345678' });

                    messageCallback(JSON.stringify({
                        subscription: { type: 'channel.prediction.lock' },
                        event,
                        timestamp: '2021-09-10T13:52:31'
                    }));

                    const predictionStore = nodecg.replicants.predictionStore.value as PredictionStore;
                    expect(predictionStore.currentPrediction).toEqual({ id: '12345678' });
                    expect(predictionStore.modificationTime).toEqual('2021-09-10T13:52:31');
                    expect(mockPredictionDataMapper.fromLockEvent).toHaveBeenCalledWith(event);
                });

                it('handles end event', () => {
                    const event = { foo: 'bar' };
                    const messageCallback = mockSocketOn.mock.calls.find(call => call[0] === 'message')[1];
                    mockPredictionDataMapper.applyEndEvent.mockReturnValue({ id: '12345678' });

                    messageCallback(JSON.stringify({
                        subscription: { type: 'channel.prediction.end' },
                        event,
                        timestamp: '2021-09-10T13:52:31'
                    }));

                    const predictionStore = nodecg.replicants.predictionStore.value as PredictionStore;
                    expect(predictionStore.currentPrediction).toEqual({ id: '12345678' });
                    expect(predictionStore.modificationTime).toEqual('2021-09-10T13:52:31');
                    expect(mockPredictionDataMapper.applyEndEvent).toHaveBeenCalledWith(event, null);
                });
            });
        });

        describe('without bundle config', () => {
            beforeEach(() => {
                setup({
                    radia: {
                        url: 'radia://api',
                        authentication: 'radia_auth'
                    }
                });
                nodecg.replicants.predictionStore.value = {
                    status: { predictionsEnabled: null },
                    currentPrediction: null
                };
            });

            it('does not start websocket', async () => {
                mockHasPredictionSupport.mockResolvedValue(true);

                await nodecg.replicantListeners.radiaSettings({ guildID: '142235235' });

                expect(mockWebSocket).not.toHaveBeenCalled();
            });
        });
    });

    describe('getPredictions', () => {
        beforeEach(() => {
            setup();
            nodecg.replicants.radiaSettings.value = { guildID: '5209358732' };
            nodecg.replicants.predictionStore.value = { currentPrediction: null };
        });

        it('fetches prediction data', async () => {
            const expectedPrediction = { id: 'FIRST-PREDICTION', outcomes: [{}]};
            mockGetPredictions.mockResolvedValue([
                expectedPrediction,
                { id: 'SECOND-PREDICTION', outcomes: []}
            ]);
            mockPredictionDataMapper.fromApiResponse.mockReturnValue(expectedPrediction);
            const ack = jest.fn();

            await nodecg.messageListeners.getPredictions(null, ack);

            expect(mockGetPredictions).toHaveBeenCalledWith('5209358732');
            expect(ack).toHaveBeenCalledWith(null, expectedPrediction);
            expect((nodecg.replicants.predictionStore.value as PredictionStore).currentPrediction)
                .toEqual(expectedPrediction);
        });

        it('does not assign prediction data if an empty response is found', async () => {
            mockGetPredictions.mockResolvedValue([]);
            const ack = jest.fn();

            await nodecg.messageListeners.getPredictions(null, ack);

            expect(ack).toHaveBeenCalledWith(null, null);
            expect((nodecg.replicants.predictionStore.value as PredictionStore).currentPrediction).toBeNull();
        });

        it('handles errors', async () => {
            mockGetPredictions.mockRejectedValue('error');
            const ack = jest.fn();

            await nodecg.messageListeners.getPredictions(null, ack);

            expect(ack).toHaveBeenCalledWith('error');
        });
    });

    describe('postPrediction', () => {
        beforeEach(() => {
            setup();
            nodecg.replicants.radiaSettings.value = { guildID: '2057205' };
            nodecg.replicants.predictionStore.value = { currentPrediction: null };
        });

        it('sends given data to API client', async () => {
            const apiResponse = { id: 'UPDATED-PREDICTION', outcomes: [{}]};
            const message = { status: 'RESOLVED' };
            mockCreatePrediction.mockResolvedValue(apiResponse);
            mockPredictionDataMapper.fromApiResponse.mockReturnValue(apiResponse);
            const ack = jest.fn();

            await nodecg.messageListeners.postPrediction(message, ack);

            expect(ack).toHaveBeenCalledWith(null, apiResponse);
            expect(mockCreatePrediction).toHaveBeenCalledWith('2057205', message);
            expect((nodecg.replicants.predictionStore.value as PredictionStore).currentPrediction).toEqual(apiResponse);
        });

        it('handles errors', async () => {
            mockCreatePrediction.mockRejectedValue('error');
            const ack = jest.fn();

            await nodecg.messageListeners.postPrediction({}, ack);

            expect(ack).toHaveBeenCalledWith('error');
        });
    });

    describe('patchPrediction', () => {
        setup();
        beforeEach(() => {
            nodecg.replicants.radiaSettings.value = { guildID: '2057205' };
            nodecg.replicants.predictionStore.value = { currentPrediction: null };
        });

        it('sends given data to API client', async () => {
            const apiResponse = { id: 'UPDATED-PREDICTION', outcomes: [{}]};
            const message = { status: 'RESOLVED' };
            mockUpdatePrediction.mockResolvedValue(apiResponse);
            mockPredictionDataMapper.fromApiResponse.mockReturnValue(apiResponse);
            const ack = jest.fn();

            await nodecg.messageListeners.patchPrediction(message, ack);

            expect(ack).toHaveBeenCalledWith(null, apiResponse);
            expect(mockUpdatePrediction).toHaveBeenCalledWith('2057205', message);
            expect((nodecg.replicants.predictionStore.value as PredictionStore).currentPrediction).toEqual(apiResponse);
        });

        it('handles errors', async () => {
            mockUpdatePrediction.mockRejectedValue('error');
            const ack = jest.fn();

            await nodecg.messageListeners.patchPrediction({}, ack);

            expect(ack).toHaveBeenCalledWith('error');
        });
    });
});
