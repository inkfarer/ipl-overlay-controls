import { PredictionStore } from 'schemas';
import { mock } from 'jest-mock-extended';
import {
    messageListeners,
    mockBundleConfig,
    mockNodecgLog,
    replicantChangeListeners,
    replicants
} from '../../__mocks__/mockNodecg';
import { UnknownFunction } from '../../../helpers/__mocks__/module';
import WebSocket from 'ws';
import type { PredictionDataMapper } from '../mappers/predictionDataMapper';
import type * as RadiaClient from '../clients/radiaClient';

const mockPredictionDataMapper = mock<typeof PredictionDataMapper>();
const mockRadiaClient = mock<typeof RadiaClient>();
const mockWebSocket = mock<WebSocket>();
const mockWebSocketClass = jest.fn().mockReturnValue(mockWebSocket);
jest.mock('ws', () => ({ __esModule: true, default: mockWebSocketClass }));
jest.mock('../mappers/predictionDataMapper', () => ({ PredictionDataMapper: mockPredictionDataMapper }));
jest.mock('../clients/radiaClient', () => mockRadiaClient);

import '../predictions';

describe('predictions', () => {
    beforeEach(() => {
        mockWebSocketClass.mockReturnValue(mockWebSocket);
    });

    describe('radiaSettings', () => {
        describe('with bundle config', () => {
            beforeEach(() => {
                replicants.predictionStore = {
                    status: {
                        predictionsEnabled: null,
                        socketOpen: false
                    },
                    currentPrediction: null,
                    modificationTime: '2021-09-10T13:52:29'
                };
            });

            it('does nothing if old guild id matches new one', async () => {
                mockRadiaClient.hasPredictionSupport.mockResolvedValue(false);

                await replicantChangeListeners.radiaSettings({ guildID: 'guildid' }, { guildID: 'guildid' });

                expect(mockRadiaClient.hasPredictionSupport).not.toHaveBeenCalled();
                expect(mockWebSocketClass).not.toHaveBeenCalled();
            });

            it('sets replicant data if predictions are not supported', async () => {
                mockRadiaClient.hasPredictionSupport.mockResolvedValue(false);

                await replicantChangeListeners.radiaSettings({ guildID: '104928194082103' });

                expect(mockRadiaClient.hasPredictionSupport).toHaveBeenCalledWith('104928194082103');
                expect(replicants.predictionStore).toEqual({
                    status: {
                        predictionsEnabled: false,
                        socketOpen: false,
                        predictionStatusReason: 'Predictions are not supported by the configured guild.'
                    },
                    currentPrediction: null,
                    modificationTime: '2021-09-10T13:52:29'
                });
                expect(mockWebSocketClass).not.toHaveBeenCalled();
            });

            it('does nothing if guild ID is empty', async () => {
                mockRadiaClient.hasPredictionSupport.mockResolvedValue(false);

                await replicantChangeListeners.radiaSettings({ guildID: '' });

                expect(mockNodecgLog.warn).toHaveBeenCalledWith('Unable to get prediction data: Error: Radia guild ID is not configured!');
                expect((replicants.predictionStore as PredictionStore).status).toEqual({
                    predictionsEnabled: false,
                    predictionStatusReason: 'Missing Radia configuration. Check your guild ID and socket URL.',
                    socketOpen: false
                });
                expect(mockRadiaClient.hasPredictionSupport).not.toHaveBeenCalled();
                expect(mockWebSocketClass).not.toHaveBeenCalled();
            });

            it('sets replicant data if predictions are supported', async () => {
                mockRadiaClient.hasPredictionSupport.mockResolvedValue(true);

                await replicantChangeListeners.radiaSettings({ guildID: '142235235' });

                expect(mockRadiaClient.hasPredictionSupport).toHaveBeenCalledWith('142235235');
                expect(replicants.predictionStore).toEqual({
                    status: {
                        socketOpen: false,
                        predictionsEnabled: true,
                    },
                    currentPrediction: null,
                    modificationTime: '2021-09-10T13:52:29'
                });
            });

            it('fetches prediction data if supported', async () => {
                mockRadiaClient.hasPredictionSupport.mockResolvedValue(true);
                const expectedPrediction = { id: 'FIRST-PREDICTION', outcomes: [ {} ]};
                // @ts-ignore
                mockRadiaClient.getPredictions.mockResolvedValue([ expectedPrediction, {
                    id: 'SECOND-PREDICTION',
                    outcomes: []
                } ]);
                // @ts-ignore
                mockPredictionDataMapper.fromApiResponse.mockReturnValue(expectedPrediction);

                await replicantChangeListeners.radiaSettings({ guildID: '142235235' });

                expect((replicants.predictionStore as PredictionStore).currentPrediction)
                    .toEqual({ id: 'FIRST-PREDICTION', outcomes: [ {} ]});
            });

            describe('socket', () => {
                beforeEach(async () => {
                    jest.useFakeTimers();
                    mockRadiaClient.hasPredictionSupport.mockResolvedValue(true);
                    mockRadiaClient.getPredictions.mockResolvedValue([]);
                    mockPredictionDataMapper.fromApiResponse.mockReturnValue(null);
                    await replicantChangeListeners.radiaSettings({ guildID: '1422352354' });
                });

                afterEach(() => {
                    jest.clearAllTimers();
                    jest.useRealTimers();
                });

                it('starts websocket', async () => {
                    expect(mockWebSocketClass).toHaveBeenCalledWith('ws://radia.url/events/guild/1422352354', {
                        headers: { Authorization: 'radia-auth-12345' }
                    });
                    expect(mockWebSocket.on).toHaveBeenCalledTimes(5);
                });

                it('closes websocket if new guild has no prediction support', async () => {
                    mockRadiaClient.hasPredictionSupport.mockResolvedValue(false);

                    await replicantChangeListeners.radiaSettings({ guildID: '1422352355' });

                    expect(mockWebSocketClass).toHaveBeenCalledWith('ws://radia.url/events/guild/1422352354', {
                        headers: { Authorization: 'radia-auth-12345' }
                    });
                    expect(mockWebSocket.on).toHaveBeenCalledTimes(5);
                    expect(mockWebSocket.close).toHaveBeenCalled();
                });

                it('handles socket opening', async () => {
                    const openCallback: UnknownFunction
                        = mockWebSocket.on.mock.calls.find(call => call[0] === 'open')[1];
                    const predictionStoreValue = replicants.predictionStore as PredictionStore;
                    predictionStoreValue.status.socketOpen = false;

                    openCallback();

                    expect(predictionStoreValue.status.socketOpen).toEqual(true);
                });

                it('terminates socket if no ping is received after socket has been open for a set amount of time', async () => {
                    const openCallback: UnknownFunction
                        = mockWebSocket.on.mock.calls.find(call => call[0] === 'open')[1];

                    openCallback();

                    expect(mockWebSocket.terminate).not.toHaveBeenCalled();

                    jest.advanceTimersByTime(21000);

                    expect(mockWebSocket.terminate).toHaveBeenCalledTimes(1);
                });

                it('terminates socket if time between pings is too long', async () => {
                    const openCallback: UnknownFunction
                        = mockWebSocket.on.mock.calls.find(call => call[0] === 'open')[1];
                    const pingCallback: UnknownFunction
                        = mockWebSocket.on.mock.calls.find(call => call[0] === 'ping')[1];

                    openCallback();

                    expect(mockWebSocket.terminate).not.toHaveBeenCalled();

                    jest.advanceTimersByTime(19008);
                    pingCallback();

                    expect(mockWebSocket.terminate).not.toHaveBeenCalled();

                    jest.advanceTimersByTime(21000);

                    expect(mockWebSocket.terminate).toHaveBeenCalledTimes(1);
                });

                it('handles socket closing', async () => {
                    const closeCallback: UnknownFunction
                        = mockWebSocket.on.mock.calls.find(call => call[0] === 'close')[1];
                    const predictionStoreValue = replicants.predictionStore as PredictionStore;
                    predictionStoreValue.status.socketOpen = true;

                    closeCallback();

                    expect(predictionStoreValue.status.socketOpen).toEqual(false);
                });

                it('attempts to reconnect to socket when socket is closed', async () => {
                    const closeCallback: UnknownFunction
                        = mockWebSocket.on.mock.calls.find(call => call[0] === 'close')[1];

                    closeCallback();
                    jest.advanceTimersByTime(1000);
                    expect(mockWebSocketClass).toHaveBeenCalledTimes(2);
                    closeCallback();
                    jest.advanceTimersByTime(2500);
                    expect(mockWebSocketClass).toHaveBeenCalledTimes(3);
                    closeCallback();
                    jest.advanceTimersByTime(5000);
                    expect(mockWebSocketClass).toHaveBeenCalledTimes(4);
                    closeCallback();
                    jest.advanceTimersByTime(10000);
                    expect(mockWebSocketClass).toHaveBeenCalledTimes(5);
                    closeCallback();
                    jest.advanceTimersByTime(25000);
                    expect(mockWebSocketClass).toHaveBeenCalledTimes(6);
                    expect(mockWebSocketClass.mock.calls
                        .every(call => call[0] === 'ws://radia.url/events/guild/1422352354')).toEqual(true);
                });

                it('resets reconnection timer when socket opens', async () => {
                    const closeCallback: UnknownFunction
                        = mockWebSocket.on.mock.calls.find(call => call[0] === 'close')[1];
                    const openCallback: UnknownFunction
                        = mockWebSocket.on.mock.calls.find(call => call[0] === 'open')[1];

                    closeCallback();
                    jest.advanceTimersByTime(1000);
                    expect(mockWebSocketClass).toHaveBeenCalledTimes(2);
                    openCallback();
                    closeCallback();
                    jest.advanceTimersByTime(1000);
                    expect(mockWebSocketClass).toHaveBeenCalledTimes(3);
                    expect(mockWebSocketClass.mock.calls
                        .every(call => call[0] === 'ws://radia.url/events/guild/1422352354')).toEqual(true);
                });

                it('resets reconnection timer when settings change', async () => {
                    const closeCallback: UnknownFunction
                        = mockWebSocket.on.mock.calls.find(call => call[0] === 'close')[1];

                    closeCallback();
                    jest.advanceTimersByTime(1000);
                    expect(mockWebSocketClass).toHaveBeenNthCalledWith(2,
                        'ws://radia.url/events/guild/1422352354',
                        expect.any(Object));
                    mockWebSocket.on.mockClear();
                    await replicantChangeListeners.radiaSettings({ guildID: '1422352355' });
                    const newCloseCallback: UnknownFunction
                        = mockWebSocket.on.mock.calls.find(call => call[0] === 'close')[1];
                    newCloseCallback();
                    jest.advanceTimersByTime(1000);
                    expect(mockWebSocketClass).toHaveBeenNthCalledWith(4,
                        'ws://radia.url/events/guild/1422352355',
                        expect.any(Object));
                });

                it('does not attempt to reconnect to socket if closing code is 4001', async () => {
                    const closeCallback: UnknownFunction
                        = mockWebSocket.on.mock.calls.find(call => call[0] === 'close')[1];

                    closeCallback(4001);
                    jest.advanceTimersByTime(2500);
                    expect(mockWebSocketClass).toHaveBeenCalledTimes(1);
                });

                it('handles socket errors', async () => {
                    const errorCallback: UnknownFunction
                        = mockWebSocket.on.mock.calls.find(call => call[0] === 'error')[1];
                    const predictionStoreValue = replicants.predictionStore as PredictionStore;
                    predictionStoreValue.status.socketOpen = true;

                    errorCallback({
                        code: '12345',
                        message: 'Error!'
                    });

                    expect(mockNodecgLog.error).toHaveBeenCalledWith('Received error from Radia websocket. Code: 12345, Message: Error!');
                });

                it('handles unknown socket message', async () => {
                    const messageCallback: UnknownFunction
                        = mockWebSocket.on.mock.calls.find(call => call[0] === 'message')[1];

                    messageCallback(JSON.stringify({ subscription: { type: 'something' } }));

                    expect((replicants.predictionStore as PredictionStore).currentPrediction).toBeNull();
                });

                it('ignores messages with old timestamps', async () => {
                    const messageCallback: UnknownFunction
                        = mockWebSocket.on.mock.calls.find(call => call[0] === 'message')[1];

                    messageCallback(JSON.stringify({
                        subscription: {
                            type: 'channel.prediction.begin'
                        }, timestamp: '2021-09-10T13:52:28'
                    }));

                    expect((replicants.predictionStore as PredictionStore).currentPrediction).toBeNull();
                });

                it('handles begin event', async () => {
                    const event = { foo: 'bar' };
                    const messageCallback: UnknownFunction
                        = mockWebSocket.on.mock.calls.find(call => call[0] === 'message')[1];
                    // @ts-ignore
                    mockPredictionDataMapper.fromBeginEvent.mockReturnValue({ id: '1234567' });

                    messageCallback(JSON.stringify({
                        subscription: { type: 'channel.prediction.begin' },
                        event,
                        timestamp: '2021-09-10T13:52:30'
                    }));

                    const predictionStore = replicants.predictionStore as PredictionStore;
                    expect(predictionStore.currentPrediction).toEqual({ id: '1234567' });
                    expect(predictionStore.modificationTime).toEqual('2021-09-10T13:52:30');
                    expect(mockPredictionDataMapper.fromBeginEvent).toHaveBeenCalledWith(event);
                });

                it('handles progress event', async () => {
                    const event = { foo: 'bar' };
                    const messageCallback: UnknownFunction
                        = mockWebSocket.on.mock.calls.find(call => call[0] === 'message')[1];
                    // @ts-ignore
                    mockPredictionDataMapper.fromProgressEvent.mockReturnValue({ id: '1234567' });

                    messageCallback(JSON.stringify({
                        subscription: { type: 'channel.prediction.progress' },
                        event,
                        timestamp: '2021-09-10T13:52:31'
                    }));

                    const predictionStore = replicants.predictionStore as PredictionStore;
                    expect(predictionStore.currentPrediction).toEqual({ id: '1234567' });
                    expect(predictionStore.modificationTime).toEqual('2021-09-10T13:52:31');
                    expect(mockPredictionDataMapper.fromProgressEvent).toHaveBeenCalledWith(event);
                });

                it('handles lock event', async () => {
                    const event = { foo: 'bar' };
                    const messageCallback: UnknownFunction
                        = mockWebSocket.on.mock.calls.find(call => call[0] === 'message')[1];
                    // @ts-ignore
                    mockPredictionDataMapper.fromLockEvent.mockReturnValue({ id: '12345678' });

                    messageCallback(JSON.stringify({
                        subscription: { type: 'channel.prediction.lock' },
                        event,
                        timestamp: '2021-09-10T13:52:31'
                    }));

                    const predictionStore = replicants.predictionStore as PredictionStore;
                    expect(predictionStore.currentPrediction).toEqual({ id: '12345678' });
                    expect(predictionStore.modificationTime).toEqual('2021-09-10T13:52:31');
                    expect(mockPredictionDataMapper.fromLockEvent).toHaveBeenCalledWith(event);
                });

                it('handles end event', async () => {
                    const event = { foo: 'bar' };
                    const messageCallback: UnknownFunction
                        = mockWebSocket.on.mock.calls.find(call => call[0] === 'message')[1];
                    // @ts-ignore
                    mockPredictionDataMapper.applyEndEvent.mockReturnValue({ id: '12345678' });

                    messageCallback(JSON.stringify({
                        subscription: { type: 'channel.prediction.end' },
                        event,
                        timestamp: '2021-09-10T13:52:31'
                    }));

                    const predictionStore = replicants.predictionStore as PredictionStore;
                    expect(predictionStore.currentPrediction).toEqual({ id: '12345678' });
                    expect(predictionStore.modificationTime).toEqual('2021-09-10T13:52:31');
                    expect(mockPredictionDataMapper.applyEndEvent).toHaveBeenCalledWith(event, null);
                });
            });
        });

        describe('without bundle config', () => {
            beforeEach(() => {
                mockBundleConfig.radia = {
                    url: 'radia://api',
                    authentication: 'radia-auth-12345'
                };
                replicants.predictionStore = {
                    status: { predictionsEnabled: null },
                    currentPrediction: null
                };
            });

            it('does not start websocket', async () => {
                mockRadiaClient.hasPredictionSupport.mockResolvedValue(true);

                await replicantChangeListeners.radiaSettings({ guildID: '142235235' });

                expect(mockWebSocketClass).not.toHaveBeenCalled();
            });
        });
    });

    describe('reconnectToRadiaSocket', () => {
        beforeEach(() => {
            replicants.predictionStore = {
                status: {
                    predictionsEnabled: null,
                    socketOpen: false
                },
                currentPrediction: null,
                modificationTime: '2021-09-10T13:52:29'
            };
            replicants.radiaSettings = { guildID: '1422352355' };
        });

        it('sets replicant data if predictions are not supported', async () => {
            const ack = jest.fn();
            mockRadiaClient.hasPredictionSupport.mockResolvedValue(false);

            await messageListeners.reconnectToRadiaSocket(null, ack);

            expect(mockRadiaClient.hasPredictionSupport).toHaveBeenCalledWith('1422352355');
            expect(replicants.predictionStore).toEqual({
                status: {
                    predictionsEnabled: false,
                    socketOpen: false,
                    predictionStatusReason: 'Predictions are not supported by the configured guild.'
                },
                currentPrediction: null,
                modificationTime: '2021-09-10T13:52:29'
            });
            expect(mockWebSocketClass).not.toHaveBeenCalled();
            expect(ack).toHaveBeenCalledWith(new Error('Unable to proceed as some Radia configuration is missing.'), null);
        });

        it('does nothing if guild ID is empty', async () => {
            replicants.radiaSettings = { guildID: '' };
            const ack = jest.fn();
            mockRadiaClient.hasPredictionSupport.mockResolvedValue(false);

            await messageListeners.reconnectToRadiaSocket(null, ack);

            expect((replicants.predictionStore as PredictionStore).status).toEqual({
                predictionsEnabled: false,
                predictionStatusReason: 'Missing Radia configuration. Check your guild ID and socket URL.',
                socketOpen: false
            });
            expect(mockRadiaClient.hasPredictionSupport).not.toHaveBeenCalled();
            expect(mockWebSocketClass).not.toHaveBeenCalled();
            expect(ack).toHaveBeenCalledWith(new Error('Radia guild ID is not configured!'), null);
        });

        it('fetches prediction data if supported and starts socket', async () => {
            const ack = jest.fn();
            mockRadiaClient.hasPredictionSupport.mockResolvedValue(true);
            const expectedPrediction = { id: 'FIRST-PREDICTION', outcomes: [ {} ]};
            mockRadiaClient.getPredictions.mockResolvedValue([
                // @ts-ignore
                expectedPrediction,
                // @ts-ignore
                { id: 'SECOND-PREDICTION', outcomes: []}
            ]);
            // @ts-ignore
            mockPredictionDataMapper.fromApiResponse.mockReturnValue(expectedPrediction);

            await messageListeners.reconnectToRadiaSocket(null, ack);

            expect(mockRadiaClient.hasPredictionSupport).toHaveBeenCalledWith('1422352355');
            expect(replicants.predictionStore).toEqual({
                status: {
                    socketOpen: false,
                    predictionsEnabled: true,
                },
                currentPrediction: { id: 'FIRST-PREDICTION', outcomes: [ {} ]},
                modificationTime: '2021-09-10T13:52:29'
            });
            expect(mockWebSocketClass).toHaveBeenCalledWith('ws://radia.url/events/guild/1422352355', {
                headers: { Authorization: 'radia-auth-12345' }
            });
            expect(mockWebSocket.on).toHaveBeenCalledTimes(5);
            expect(ack).toHaveBeenCalledWith(null, null);
        });
    });

    describe('getPredictions', () => {
        beforeEach(() => {
            replicants.radiaSettings = { guildID: '5209358732' };
            replicants.predictionStore = { currentPrediction: null };
        });

        it('fetches prediction data', async () => {
            const expectedPrediction = { id: 'FIRST-PREDICTION', outcomes: [ {} ]};
            mockRadiaClient.getPredictions
                // @ts-ignore
                .mockResolvedValue([ expectedPrediction, { id: 'SECOND-PREDICTION', outcomes: []} ]);
            // @ts-ignore
            mockPredictionDataMapper.fromApiResponse.mockReturnValue(expectedPrediction);
            const ack = jest.fn();

            await messageListeners.getPredictions(null, ack);

            expect(mockRadiaClient.getPredictions).toHaveBeenCalledWith('5209358732');
            expect(ack).toHaveBeenCalledWith(null, expectedPrediction);
            expect((replicants.predictionStore as PredictionStore).currentPrediction)
                .toEqual(expectedPrediction);
        });

        it('does not assign prediction data if an empty response is found', async () => {
            mockRadiaClient.getPredictions.mockResolvedValue([]);
            const ack = jest.fn();

            await messageListeners.getPredictions(null, ack);

            expect(ack).toHaveBeenCalledWith(null, null);
            expect((replicants.predictionStore as PredictionStore).currentPrediction).toBeNull();
        });

        it('handles errors', async () => {
            mockRadiaClient.getPredictions.mockRejectedValue('error');
            const ack = jest.fn();

            await messageListeners.getPredictions(null, ack);

            expect(ack).toHaveBeenCalledWith('error');
        });
    });

    describe('postPrediction', () => {
        beforeEach(() => {
            replicants.radiaSettings = { guildID: '2057205' };
            replicants.predictionStore = { currentPrediction: null };
        });

        it('sends given data to API client', async () => {
            const apiResponse = { id: 'UPDATED-PREDICTION', outcomes: [ {} ]};
            const message = { status: 'RESOLVED' };
            // @ts-ignore
            mockRadiaClient.createPrediction.mockResolvedValue(apiResponse);
            // @ts-ignore
            mockPredictionDataMapper.fromApiResponse.mockReturnValue(apiResponse);
            const ack = jest.fn();

            await messageListeners.postPrediction(message, ack);

            expect(ack).toHaveBeenCalledWith(null, apiResponse);
            expect(mockRadiaClient.createPrediction).toHaveBeenCalledWith('2057205', message);
            expect((replicants.predictionStore as PredictionStore).currentPrediction).toEqual(apiResponse);
        });

        it('handles errors', async () => {
            mockRadiaClient.createPrediction.mockRejectedValue('error');
            const ack = jest.fn();

            await messageListeners.postPrediction({}, ack);

            expect(ack).toHaveBeenCalledWith('error');
        });
    });

    describe('patchPrediction', () => {
        beforeEach(() => {
            replicants.radiaSettings = { guildID: '2057205' };
            replicants.predictionStore = { currentPrediction: null };
        });

        it('sends given data to API client', async () => {
            const apiResponse = { id: 'UPDATED-PREDICTION', outcomes: [ {} ]};
            const message = { status: 'RESOLVED' };
            // @ts-ignore
            mockRadiaClient.updatePrediction.mockResolvedValue(apiResponse);
            // @ts-ignore
            mockPredictionDataMapper.fromApiResponse.mockReturnValue(apiResponse);
            const ack = jest.fn();

            await messageListeners.patchPrediction(message, ack);

            expect(ack).toHaveBeenCalledWith(null, apiResponse);
            expect(mockRadiaClient.updatePrediction).toHaveBeenCalledWith('2057205', message);
            expect((replicants.predictionStore as PredictionStore).currentPrediction).toEqual(apiResponse);
        });

        it('handles errors', async () => {
            mockRadiaClient.updatePrediction.mockRejectedValue('error');
            const ack = jest.fn();

            await messageListeners.patchPrediction({}, ack);

            expect(ack).toHaveBeenCalledWith('error');
        });
    });
});
