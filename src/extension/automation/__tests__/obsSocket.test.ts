import OBSWebSocket from 'obs-websocket-js';
import { mock } from 'jest-mock-extended';
import { UnknownFunction } from '../../../helpers/__mocks__/module';
import { messageListeners, replicants } from '../../__mocks__/mockNodecg';
import { ObsStatus } from '../../../types/enums/ObsStatus';
import { ObsData } from '../../../types/schemas';
const mockObsWebSocket = mock<OBSWebSocket>();
const mockObsWebSocketClass = jest.fn().mockReturnValue(mockObsWebSocket);
jest.mock('obs-websocket-js', () => ({ __esModule: true, default: mockObsWebSocketClass }));

describe('obsSocket', () => {
    const socketEventCallbacks: Record<string, UnknownFunction> = {};

    mockObsWebSocket.on.mockImplementation((messageName, callback) => {
        socketEventCallbacks[messageName] = callback;
        return this;
    });

    const { setCurrentScene } = require('../obsSocket');

    replicants.obsData = { status: ObsStatus.NOT_CONNECTED, enabled: true };
    beforeEach(() => {
        replicants.obsData = { status: ObsStatus.NOT_CONNECTED, enabled: true };
        replicants.obsCredentials = { address: 'localhost:4444444', password: 'pwd' };

        jest.restoreAllMocks();
        jest.clearAllMocks();
        jest.useFakeTimers();
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
            replicants.obsData = { status: ObsStatus.CONNECTED, enabled: true };

            socketEventCallbacks.ConnectionClosed();

            expect((replicants.obsData as ObsData).status).toEqual(ObsStatus.NOT_CONNECTED);
            expect(mockObsWebSocket.disconnect).toHaveBeenCalledTimes(0);
            expect(mockObsWebSocket.connect).toHaveBeenCalledTimes(0);

            jest.advanceTimersByTime(5000);

            expect(mockObsWebSocket.disconnect).toHaveBeenCalledTimes(1);
            expect(mockObsWebSocket.connect).toHaveBeenCalledTimes(1);
        });

        it('does not reconnect if the socket is already not connected', () => {
            replicants.obsData = { status: ObsStatus.NOT_CONNECTED, enabled: true };

            socketEventCallbacks.ConnectionClosed();

            expect((replicants.obsData as ObsData).status).toEqual(ObsStatus.NOT_CONNECTED);
            expect(mockObsWebSocket.disconnect).toHaveBeenCalledTimes(0);
            expect(mockObsWebSocket.connect).toHaveBeenCalledTimes(0);

            jest.advanceTimersByTime(5000);

            expect(mockObsWebSocket.disconnect).toHaveBeenCalledTimes(0);
            expect(mockObsWebSocket.connect).toHaveBeenCalledTimes(0);
        });

        it('does not reconnect if the obs socket is disabled', () => {
            replicants.obsData = { status: ObsStatus.CONNECTED, enabled: false };

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

        it('updates scene data if no data was included in the event', async () => {
            mockObsWebSocket.send.calledWith('GetSceneList').mockResolvedValue({
                scenes: [{ name: 'Scene One' }, { name: 'Scene Two' }] as unknown as OBSWebSocket.Scene[],
                messageId: '',
                status: 'ok'
            });
            mockObsWebSocket.send.calledWith('GetCurrentScene').mockResolvedValue({
                name: 'Current Scene',
                messageId: '',
                status: 'ok'
            });

            await socketEventCallbacks.ScenesChanged({ });

            expect((replicants.obsData as ObsData).scenes).toEqual(['Scene One', 'Scene Two']);
            expect(mockObsWebSocket.send).toHaveBeenCalledTimes(2);
            expect(mockObsWebSocket.send).toHaveBeenCalledWith('GetSceneList');
            expect(mockObsWebSocket.send).toHaveBeenCalledWith('GetCurrentScene');
        });
    });

    describe('event: SwitchScenes', () => {
        it('updates current scene', () => {
            socketEventCallbacks.SwitchScenes({
                'scene-name': 'New Scene'
            });

            expect((replicants.obsData as ObsData).currentScene).toEqual('New Scene');
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

        it('returns error if obs socket is disabled', async () => {
            (replicants.obsData as ObsData).enabled = false;
            const cb = jest.fn();

            await messageListeners.connectToObs({ address: '192.168.1.222:2222' }, cb);

            expect(cb).toHaveBeenCalledWith(new Error('OBS integration is disabled.'));
            expect(mockObsWebSocket.disconnect).not.toHaveBeenCalled();
            expect(mockObsWebSocket.connect).not.toHaveBeenCalled();
            expect(replicants.obsCredentials).toEqual({ address: '192.168.1.222:2222' });
        });

        it('gets scene data after connecting', async () => {
            const cb = jest.fn();

            mockObsWebSocket.send.calledWith('GetSceneList').mockResolvedValue({
                scenes: [{ name: 'Scene One' }, { name: 'Scene Two' }] as unknown as OBSWebSocket.Scene[],
                messageId: '',
                status: 'ok'
            });
            mockObsWebSocket.send.calledWith('GetCurrentScene').mockResolvedValue({
                name: 'Current Scene',
                messageId: '',
                status: 'ok'
            });
            mockObsWebSocket.send.calledWith('GetVersion').mockResolvedValue({
                'obs-websocket-version': '4.9.0',
                messageId: '',
                status: 'ok'
            });

            await messageListeners.connectToObs({ address: '192.168.1.222:2222' }, cb);

            expect(cb).toHaveBeenCalled();
            const obsData = replicants.obsData as ObsData;
            expect(obsData.scenes).toEqual(['Scene One', 'Scene Two']);
            expect(obsData.currentScene).toEqual('Current Scene');
            expect(mockObsWebSocket.send).toHaveBeenCalledTimes(3);
            expect(mockObsWebSocket.send).toHaveBeenCalledWith('GetVersion');
            expect(mockObsWebSocket.send).toHaveBeenCalledWith('GetSceneList');
            expect(mockObsWebSocket.send).toHaveBeenCalledWith('GetCurrentScene');
        });

        it('does not get scene data if connecting to socket fails', async () => {
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

    describe('setObsData', () => {
        it('returns error if gameplay scene cannot be found in scene list', () => {
            const cb = jest.fn();
            replicants.obsData = { scenes: ['scene-one']};

            messageListeners.setObsData({ gameplayScene: 'scene-two' }, cb);

            expect(cb).toHaveBeenCalledWith(new Error('Could not find one or more of the provided scenes.'));
        });

        it('returns error if intermission scene cannot be found in scene list', () => {
            const cb = jest.fn();
            replicants.obsData = { scenes: ['scene-one']};

            messageListeners.setObsData({ gameplayScene: 'scene-one', intermissionScene: 'scene-two' }, cb);

            expect(cb).toHaveBeenCalledWith(new Error('Could not find one or more of the provided scenes.'));
        });

        it('returns error if no scenes are present', () => {
            const cb = jest.fn();
            replicants.obsData = { scenes: null };

            messageListeners.setObsData({ gameplayScene: 'scene-one' }, cb);

            expect(cb).toHaveBeenCalledWith(new Error('Could not find one or more of the provided scenes.'));
        });

        it('updates obs data', () => {
            const cb = jest.fn();
            replicants.obsData = {
                status: ObsStatus.CONNECTED,
                scenes: ['scene-one', 'scene-two']
            };

            messageListeners.setObsData({
                gameplayScene: 'scene-one',
                intermissionScene: 'scene-two'
            }, cb);

            expect(cb).toHaveBeenCalledWith();
            expect(replicants.obsData).toEqual({
                status: ObsStatus.CONNECTED,
                scenes: ['scene-one', 'scene-two'],
                gameplayScene: 'scene-one',
                intermissionScene: 'scene-two'
            });
        });
    });

    describe('setObsSocketEnabled', () => {
        it('returns error if provided argument is null', () => {
            const cb = jest.fn();

            messageListeners.setObsSocketEnabled(null, cb);

            expect(cb).toHaveBeenCalledWith(new Error('Invalid arguments.'));
            expect(mockObsWebSocket.disconnect).not.toHaveBeenCalled();
            expect(mockObsWebSocket.connect).not.toHaveBeenCalled();
        });

        it('returns error if provided argument is undefined', () => {
            const cb = jest.fn();

            messageListeners.setObsSocketEnabled(undefined, cb);

            expect(cb).toHaveBeenCalledWith(new Error('Invalid arguments.'));
            expect(mockObsWebSocket.disconnect).not.toHaveBeenCalled();
            expect(mockObsWebSocket.connect).not.toHaveBeenCalled();
        });

        it('disconnects from socket when disabling socket and stops reconnecting', async () => {
            jest.spyOn(global, 'clearInterval');
            const cb = jest.fn();

            await messageListeners.setObsSocketEnabled(false, cb);

            expect(cb).toHaveBeenCalledWith(null);
            expect(mockObsWebSocket.disconnect).toHaveBeenCalledTimes(1);
            expect(mockObsWebSocket.connect).not.toHaveBeenCalled();
            expect(global.clearInterval).toHaveBeenCalledTimes(1);
        });

        it('connects to socket when enabling socket', async () => {
            const cb = jest.fn();

            await messageListeners.setObsSocketEnabled(true, cb);

            expect(cb).toHaveBeenCalledWith(null);
            expect(mockObsWebSocket.disconnect).toHaveBeenCalledTimes(1);
            expect(mockObsWebSocket.connect).toHaveBeenCalledTimes(1);
        });
    });

    describe('setCurrentScene', () => {
        it('sends message to set current scene', async () => {
            await setCurrentScene('new-scene');

            expect(mockObsWebSocket.send).toHaveBeenCalledWith('SetCurrentScene', { 'scene-name': 'new-scene' });
        });
    });
});
