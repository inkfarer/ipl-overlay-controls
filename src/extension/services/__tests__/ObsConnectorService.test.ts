import { ObsConnectorService } from '../ObsConnectorService';
import { mockNodecg, replicants } from '../../__mocks__/mockNodecg';
import OBSWebSocket, { OBSWebSocketError } from 'obs-websocket-js';
import { ObsStatus } from '../../../types/enums/ObsStatus';
import { ObsData } from '../../../types/schemas';
import { flushPromises } from '@vue/test-utils';

describe('ObsConnectorService', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.spyOn(OBSWebSocket.prototype, 'connect').mockResolvedValue(null);
        jest.spyOn(OBSWebSocket.prototype, 'disconnect').mockResolvedValue(null);
        jest.spyOn(OBSWebSocket.prototype, 'call').mockResolvedValue(null);
        replicants.obsData = {
            enabled: false
        };
        replicants.obsCredentials = {
            address: 'wss://test-obs',
            password: 'test pwd'
        };
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    describe('constructor', () => {
        it('does not attempt connection if obs is not enabled', () => {
            jest.spyOn(ObsConnectorService.prototype, 'connect');
            replicants.obsData = {
                enabled: false
            };

            const service = new ObsConnectorService(mockNodecg);

            expect(service.connect).not.toHaveBeenCalled();
        });

        it('connects to OBS if integration is enabled', async () => {
            jest.spyOn(ObsConnectorService.prototype, 'connect').mockResolvedValue(null);
            replicants.obsData = {
                enabled: true
            };
            replicants.obsCredentials = {
                address: 'wss://obs-websocket'
            };

            const service = new ObsConnectorService(mockNodecg);
            await flushPromises();

            expect(service.connect).toHaveBeenCalled();
        });
    });

    describe('handleClosure', () => {
        it('updates obs status and does not try to reconnect if obs is disabled', () => {
            replicants.obsData = {
                enabled: false,
                status: ObsStatus.CONNECTED
            };
            const service = new ObsConnectorService(mockNodecg);
            jest.spyOn(service, 'startReconnecting');

            service['handleClosure'](new OBSWebSocketError(9999, 'message'));

            expect(replicants.obsData).toEqual({
                enabled: false,
                status: ObsStatus.NOT_CONNECTED
            });
            expect(service.startReconnecting).not.toHaveBeenCalled();
        });

        it('updates obs status and tries to reconnect if obs is enabled', () => {
            replicants.obsData = {
                enabled: true,
                status: ObsStatus.CONNECTED
            };
            const service = new ObsConnectorService(mockNodecg);
            jest.spyOn(service, 'startReconnecting');

            service['handleClosure'](new OBSWebSocketError(9999, 'message'));

            expect(replicants.obsData).toEqual({
                enabled: true,
                status: ObsStatus.NOT_CONNECTED
            });
            expect(service.startReconnecting).toHaveBeenCalled();
        });

        it.each([
            ObsStatus.CONNECTING,
            ObsStatus.NOT_CONNECTED
        ])('does nothing if obs status is %s', status => {
            replicants.obsData = {
                enabled: true,
                status
            };
            const service = new ObsConnectorService(mockNodecg);
            jest.spyOn(service, 'startReconnecting');

            service['handleClosure'](new OBSWebSocketError(9999, 'message'));

            expect(replicants.obsData).toEqual({
                enabled: true,
                status
            });
            expect(service.startReconnecting).not.toHaveBeenCalled();
        });
    });

    describe('handleOpening', () => {
        it('updates status and stops reconnecting', () => {
            const service = new ObsConnectorService(mockNodecg);
            jest.spyOn(service, 'stopReconnecting');

            service['handleOpening']();

            expect(service.stopReconnecting).toHaveBeenCalled();
            expect(replicants.obsData).toEqual({
                enabled: false,
                status: ObsStatus.CONNECTED
            });
        });
    });

    describe('handleSceneListChange', () => {
        it('updates scenes', () => {
            const service = new ObsConnectorService(mockNodecg);
            jest.spyOn(service as any, 'updateScenes').mockReturnValue(null);

            service['handleSceneListChange']({
                scenes: [{ sceneName: 'scene1' }, { sceneName: 'scene2' }, { sceneName: 'scene3' }]
            });

            expect(service['updateScenes']).toHaveBeenCalledWith(['scene1', 'scene2', 'scene3']);
        });
    });

    describe('handleProgramSceneChange', () => {
        it('updates scenes', () => {
            const service = new ObsConnectorService(mockNodecg);

            service['handleProgramSceneChange']({
                sceneName: 'new-scene'
            });

            expect(replicants.obsData).toEqual({
                enabled: false,
                currentScene: 'new-scene'
            });
        });
    });

    describe('connect', () => {
        it('connects to the obs socket and loads the list of scenes', async () => {
            replicants.obsCredentials = {
                address: 'wss://obs-socket',
                password: 'test pwd'
            };
            const service = new ObsConnectorService(mockNodecg);
            jest.spyOn(service as any, 'loadSceneList').mockResolvedValue(null);

            await service.connect();

            expect(replicants.obsData).toEqual({ enabled: false, status: ObsStatus.CONNECTING });
            expect(OBSWebSocket.prototype.disconnect).toHaveBeenCalled();
            expect(OBSWebSocket.prototype.connect).toHaveBeenCalledWith('wss://obs-socket', 'test pwd');
            expect(service['loadSceneList']).toHaveBeenCalled();
        });

        it('starts reconnecting on connection failure', async () => {
            replicants.obsCredentials = {
                address: 'wss://obs-socket',
                password: 'test pwd'
            };
            const service = new ObsConnectorService(mockNodecg);
            const error = new Error('test error');
            Object.defineProperty(error, 'code', { value: 10000 });
            jest.spyOn(OBSWebSocket.prototype, 'connect').mockRejectedValue(error);
            jest.spyOn(service as any, 'loadSceneList').mockResolvedValue(null);
            jest.spyOn(service, 'startReconnecting');

            await expect(() => service.connect()).rejects.toThrow(new Error('Failed to connect to OBS: test error'));

            expect(replicants.obsData).toEqual({ enabled: false, status: ObsStatus.NOT_CONNECTED });
            expect(OBSWebSocket.prototype.disconnect).toHaveBeenCalled();
            expect(OBSWebSocket.prototype.connect).toHaveBeenCalledWith('wss://obs-socket', 'test pwd');
            expect(service.startReconnecting).toHaveBeenCalledWith(10000);
            expect(service['loadSceneList']).not.toHaveBeenCalled();
        });

        it('does not start reconnecting on error if specified in arguments', async () => {
            replicants.obsCredentials = {
                address: 'wss://obs-socket',
                password: 'test pwd'
            };
            const service = new ObsConnectorService(mockNodecg);
            jest.spyOn(OBSWebSocket.prototype, 'connect').mockRejectedValue(new Error('test error'));
            jest.spyOn(service as any, 'loadSceneList').mockResolvedValue(null);
            jest.spyOn(service, 'startReconnecting');

            await expect(() => service.connect(false))
                .rejects.toThrow(new Error('Failed to connect to OBS: test error'));

            expect(replicants.obsData).toEqual({ enabled: false, status: ObsStatus.NOT_CONNECTED });
            expect(OBSWebSocket.prototype.disconnect).toHaveBeenCalled();
            expect(OBSWebSocket.prototype.connect).toHaveBeenCalledWith('wss://obs-socket', 'test pwd');
            expect(service.startReconnecting).not.toHaveBeenCalled();
            expect(service['loadSceneList']).not.toHaveBeenCalled();
        });
    });

    describe('disconnect', () => {
        it('disconnects from socket and stops reconnecting', async () => {
            const service = new ObsConnectorService(mockNodecg);
            jest.spyOn(service, 'stopReconnecting');

            await service.disconnect();

            expect(service.stopReconnecting).toHaveBeenCalled();
            expect(OBSWebSocket.prototype.disconnect).toHaveBeenCalled();
        });
    });

    describe('loadSceneList', () => {
        it('loads and updates scene data', async () => {
            jest.spyOn(OBSWebSocket.prototype, 'call').mockResolvedValue({
                currentProgramSceneName: 'scene1',
                scenes: [
                    { sceneName: 'scene1' },
                    { sceneName: 'scene2' },
                    { sceneName: 'scene3' }
                ]
            });
            const service = new ObsConnectorService(mockNodecg);
            jest.spyOn(service as any, 'updateScenes');

            await service['loadSceneList']();

            expect(OBSWebSocket.prototype.call).toHaveBeenCalledWith('GetSceneList');
            expect((replicants.obsData as ObsData).currentScene).toEqual('scene1');
            expect(service['updateScenes']).toHaveBeenCalledWith(['scene1', 'scene2', 'scene3']);
        });
    });

    describe('startReconnecting', () => {
        beforeAll(() => {
            jest.useFakeTimers();
        });

        afterAll(() => {
            jest.useRealTimers();
        });

        it.each([4009, 4010, 4011])('does nothing if closure code is %d', code => {
            const service = new ObsConnectorService(mockNodecg);
            jest.spyOn(service, 'stopReconnecting');
            jest.spyOn(global, 'setInterval');

            service.startReconnecting(code);

            expect(service.stopReconnecting).not.toHaveBeenCalled();
            expect(global.setInterval).not.toHaveBeenCalled();
        });

        it('sets an interval to reconnect to the socket', () => {
            const service = new ObsConnectorService(mockNodecg);
            jest.spyOn(service, 'stopReconnecting');
            jest.spyOn(global, 'setInterval');
            jest.spyOn(service, 'connect');

            service.startReconnecting(null);

            expect(service.stopReconnecting).toHaveBeenCalledTimes(1);
            expect(global.setInterval).toHaveBeenCalledTimes(1);
            expect(service.connect).toHaveBeenCalledTimes(0);

            jest.advanceTimersByTime(10000);
            expect(service.connect).toHaveBeenCalledTimes(1);
            expect(service.connect).toHaveBeenCalledWith(false);
            jest.advanceTimersByTime(10000);
            expect(service.connect).toHaveBeenCalledTimes(2);
        });
    });

    describe('stopReconnecting', () => {
        it('clears the reconnection interval', () => {
            const service = new ObsConnectorService(mockNodecg);
            const interval = 'interval (test)';
            (service as any).reconnectionInterval = interval;
            (service as any).reconnectionCount = 100;
            jest.spyOn(global, 'clearInterval');

            service.stopReconnecting();

            expect(clearInterval).toHaveBeenCalledWith(interval);
            expect((service as any).reconnectionInterval).toBeNull();
            expect((service as any).reconnectionCount).toEqual(0);
        });
    });

    describe('updateScenes', () => {
        it('does nothing if an empty list is provided', () => {
            replicants.obsData = {
                gameplayScene: 'gameplay',
                intermissionScene: 'intermission'
            };
            const service = new ObsConnectorService(mockNodecg);

            service['updateScenes']([]);

            expect(replicants.obsData).toEqual({
                gameplayScene: 'gameplay',
                intermissionScene: 'intermission'
            });
            expect(mockNodecg.sendMessage).not.toHaveBeenCalled();
        });

        it('updates the gameplay scene and sends a message if the gameplay scene is no longer found', () => {
            replicants.obsData = {
                gameplayScene: 'gameplay',
                intermissionScene: 'intermission'
            };
            const service = new ObsConnectorService(mockNodecg);

            service['updateScenes']([
                'scene1',
                'intermission'
            ]);

            expect(replicants.obsData).toEqual({
                gameplayScene: 'scene1',
                intermissionScene: 'intermission',
                scenes: [
                    'scene1',
                    'intermission'
                ]
            });
            expect(mockNodecg.sendMessage).toHaveBeenCalledWith('obsSceneConfigurationChangedAfterUpdate');
        });

        it('updates the intermission scene and sends a message if the intermission scene is no longer found', () => {
            replicants.obsData = {
                gameplayScene: 'gameplay',
                intermissionScene: 'intermission'
            };
            const service = new ObsConnectorService(mockNodecg);

            service['updateScenes']([
                'gameplay',
                'scene2'
            ]);

            expect(replicants.obsData).toEqual({
                gameplayScene: 'gameplay',
                intermissionScene: 'scene2',
                scenes: [
                    'gameplay',
                    'scene2'
                ]
            });
            expect(mockNodecg.sendMessage).toHaveBeenCalledWith('obsSceneConfigurationChangedAfterUpdate');
        });

        it('updates the list of scenes', () => {
            replicants.obsData = {
                gameplayScene: 'gameplay',
                intermissionScene: 'intermission',
                scenes: [
                    'gameplay',
                    'intermission'
                ]
            };
            const service = new ObsConnectorService(mockNodecg);

            service['updateScenes']([
                'gameplay',
                'intermission',
                'new scene'
            ]);

            expect(replicants.obsData).toEqual({
                gameplayScene: 'gameplay',
                intermissionScene: 'intermission',
                scenes: [
                    'gameplay',
                    'intermission',
                    'new scene'
                ]
            });
            expect(mockNodecg.sendMessage).not.toHaveBeenCalled();
        });
    });
});
