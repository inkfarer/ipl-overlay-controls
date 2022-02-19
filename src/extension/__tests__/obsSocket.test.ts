import OBSWebSocket from 'obs-websocket-js';
import { mock } from 'jest-mock-extended';
import { UnknownFunction } from '../../helpers/__mocks__/module';
import { messageListeners, replicants } from '../__mocks__/mockNodecg';
import { ObsStatus } from '../../types/enums/ObsStatus';
import { ObsData } from '../../types/schemas';
const mockObsWebSocket = mock<OBSWebSocket>();
const mockObsWebSocketClass = jest.fn().mockReturnValue(mockObsWebSocket);
jest.mock('obs-websocket-js', () => ({ __esModule: true, default: mockObsWebSocketClass }));

describe('obsSocket', () => {
    const socketEventCallbacks: Record<string, UnknownFunction> = {};

    mockObsWebSocket.on.mockImplementation((messageName, callback) => {
        socketEventCallbacks[messageName] = callback;
        return this;
    });

    replicants.obsData = { status: ObsStatus.NOT_CONNECTED };
    beforeEach(() => {
        replicants.obsData = { status: ObsStatus.NOT_CONNECTED };
        replicants.obsCredentials = { address: 'localhost:4444444', password: 'pwd' };

        jest.restoreAllMocks();
        jest.clearAllMocks();
        jest.useFakeTimers();

        require('../obsSocket');
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    describe('event: error', () => {
        it('reconnects to the socket after a delay', () => {
            socketEventCallbacks.error();
            jest.advanceTimersByTime(5000);

            expect(mockObsWebSocket.disconnect).toHaveBeenCalledTimes(1);
            expect(mockObsWebSocket.connect).toHaveBeenCalledTimes(1);
        });
    });

    describe('event: ConnectionClosed', () => {
        it('reconnects to the socket if it was previously connected', () => {
            replicants.obsData = { status: ObsStatus.CONNECTED };

            socketEventCallbacks.ConnectionClosed();

            expect((replicants.obsData as ObsData).status).toEqual(ObsStatus.NOT_CONNECTED);
            expect(mockObsWebSocket.disconnect).toHaveBeenCalledTimes(0);
            expect(mockObsWebSocket.connect).toHaveBeenCalledTimes(0);

            jest.advanceTimersByTime(5000);

            expect(mockObsWebSocket.disconnect).toHaveBeenCalledTimes(1);
            expect(mockObsWebSocket.connect).toHaveBeenCalledTimes(1);
        });

        it('does not reconnect if the socket is already not connected', () => {
            replicants.obsData = { status: ObsStatus.NOT_CONNECTED };

            socketEventCallbacks.ConnectionClosed();

            expect((replicants.obsData as ObsData).status).toEqual(ObsStatus.NOT_CONNECTED);
            expect(mockObsWebSocket.disconnect).toHaveBeenCalledTimes(0);
            expect(mockObsWebSocket.connect).toHaveBeenCalledTimes(0);

            jest.advanceTimersByTime(5000);

            expect(mockObsWebSocket.disconnect).toHaveBeenCalledTimes(0);
            expect(mockObsWebSocket.connect).toHaveBeenCalledTimes(0);
        });
    });

    describe('event: ConnectionOpened', () => {
        it('sets connection status and stops reconnecting', () => {
            jest.spyOn(global, 'clearInterval');

            socketEventCallbacks.ConnectionOpened();

            expect((replicants.obsData as ObsData).status).toEqual(ObsStatus.CONNECTED);
            expect(global.clearInterval).toHaveBeenCalledTimes(1);
        });
    });

    describe('event: ScenesChanged', () => {
        it('updates scene data', () => {
            socketEventCallbacks.ScenesChanged({
                scenes: [
                    { name: 'Scene One' },
                    { name: 'Scene Two' }
                ]
            });

            expect((replicants.obsData as ObsData).scenes).toEqual(['Scene One', 'Scene Two']);
        });
    });

    describe('event: TransitionListChanged', () => {
        it('updates transition data', () => {
            socketEventCallbacks.TransitionListChanged({
                transitions: [
                    { name: 'Fade' },
                    { name: 'Cut' },
                    { name: 'Stinger' }
                ]
            });

            expect((replicants.obsData as ObsData).transitions).toEqual(['Fade', 'Cut', 'Stinger']);
        });
    });

    describe('connectToObs', () => {
        it('connects to OBS socket with provided credentials', async () => {
            const cb = jest.fn();

            await messageListeners.connectToObs({ address: '192.168.1.222:2222' }, cb);

            expect(cb).toHaveBeenCalled();
            expect(mockObsWebSocket.disconnect).toHaveBeenCalledTimes(1);
            expect(mockObsWebSocket.connect).toHaveBeenCalledTimes(1);
            expect(mockObsWebSocket.connect).toHaveBeenCalledWith({ address: '192.168.1.222:2222' });
            expect(replicants.obsCredentials).toEqual({ address: '192.168.1.222:2222' });
        });

        it('gets scene and transition data after connecting', async () => {
            const cb = jest.fn();

            mockObsWebSocket.send.calledWith('GetSceneList').mockResolvedValue({
                scenes: [{ name: 'Scene One' }, { name: 'Scene Two' }] as unknown as OBSWebSocket.Scene[],
                messageId: '',
                status: 'ok'
            });
            mockObsWebSocket.send.calledWith('GetTransitionList').mockResolvedValue({
                transitions: [{ name: 'Cut' }, { name: 'Fade' }],
                messageId: '',
                status: 'ok'
            });

            await messageListeners.connectToObs({ address: '192.168.1.222:2222' }, cb);

            expect(cb).toHaveBeenCalled();
            const obsData = replicants.obsData as ObsData;
            expect(obsData.scenes).toEqual(['Scene One', 'Scene Two']);
            expect(obsData.transitions).toEqual(['Cut', 'Fade']);
            expect(mockObsWebSocket.send).toHaveBeenCalledTimes(2);
            expect(mockObsWebSocket.send).toHaveBeenCalledWith('GetSceneList');
            expect(mockObsWebSocket.send).toHaveBeenCalledWith('GetTransitionList');
        });

        it('does not get scene and transition data if connecting to socket fails', async () => {
            const cb = jest.fn();

            mockObsWebSocket.connect.mockRejectedValue('Err');

            await messageListeners.connectToObs({ address: '192.168.1.222:2222' }, cb);

            expect(cb).toHaveBeenCalled();
            expect(mockObsWebSocket.send).not.toHaveBeenCalled();
            expect(mockObsWebSocket.connect).toHaveBeenCalledTimes(1);
            expect((replicants.obsData as ObsData).status).toEqual(ObsStatus.NOT_CONNECTED);
        });

        it('attempts to reconnect if obs connection fails', async () => {
            const cb = jest.fn();

            mockObsWebSocket.connect.mockRejectedValue('Err');

            await messageListeners.connectToObs({ address: '192.168.1.222:2222' }, cb);

            expect(mockObsWebSocket.connect).toHaveBeenCalledTimes(1);

            jest.advanceTimersByTime(5000);

            expect(mockObsWebSocket.connect).toHaveBeenCalledTimes(2);
        });
    });
});
