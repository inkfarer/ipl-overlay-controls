import { ObsConnectorService } from '../ObsConnectorService';
import { mockNodecg, replicants } from '../../__mocks__/mockNodecg';
import OBSWebSocket, { OBSWebSocketError } from 'obs-websocket-js';
import { ObsStatus } from 'types/enums/ObsStatus';
import { ObsState } from 'schemas';
import { flushPromises } from '@vue/test-utils';
import Sharp from 'sharp';

jest.mock('sharp');

describe('ObsConnectorService', () => {
    let service: ObsConnectorService;

    beforeEach(() => {
        jest.useFakeTimers();
        jest.spyOn(OBSWebSocket.prototype, 'connect').mockResolvedValue(null);
        jest.spyOn(OBSWebSocket.prototype, 'disconnect').mockResolvedValue(null);
        jest.spyOn(OBSWebSocket.prototype, 'call').mockResolvedValue(null);
        replicants.obsState = {
            enabled: false
        };
        replicants.obsCredentials = {
            address: 'wss://test-obs',
            password: 'test pwd'
        };

        service = new ObsConnectorService(mockNodecg);
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    describe('constructor', () => {
        it('does not attempt connection if obs is not enabled', () => {
            jest.spyOn(ObsConnectorService.prototype, 'connect');
            replicants.obsState = {
                enabled: false
            };

            const service = new ObsConnectorService(mockNodecg);

            expect(service.connect).not.toHaveBeenCalled();
        });

        it('connects to OBS if integration is enabled', async () => {
            jest.spyOn(ObsConnectorService.prototype, 'connect').mockResolvedValue(null);
            replicants.obsState = {
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

    describe('updateConfig', () => {
        it('replaces existing config', () => {
            replicants.obsConfig = [
                { sceneCollection: 'test-sc-1', intermissionScene: 'test-scene' },
                { sceneCollection: 'test-sc-2', gameplayScene: 'test-scene-2' },
                { sceneCollection: 'test-sc-3', intermissionScene: 'test-scene-3' }
            ];

            service.updateConfig({ sceneCollection: 'test-sc-2', gameplayInput: 'test-gameplay-input' });

            expect(replicants.obsConfig).toEqual([
                { sceneCollection: 'test-sc-1', intermissionScene: 'test-scene' },
                { sceneCollection: 'test-sc-2', gameplayInput: 'test-gameplay-input' },
                { sceneCollection: 'test-sc-3', intermissionScene: 'test-scene-3' }
            ]);
        });

        it('creates a new config item if required', () => {
            replicants.obsConfig = [
                { sceneCollection: 'test-sc-1', intermissionScene: 'test-scene' },
                { sceneCollection: 'test-sc-3', intermissionScene: 'test-scene-3' }
            ];

            service.updateConfig({ sceneCollection: 'test-sc-2', gameplayInput: 'test-gameplay-input' });

            expect(replicants.obsConfig).toEqual([
                { sceneCollection: 'test-sc-1', intermissionScene: 'test-scene' },
                { sceneCollection: 'test-sc-3', intermissionScene: 'test-scene-3' },
                { sceneCollection: 'test-sc-2', gameplayInput: 'test-gameplay-input' }
            ]);
        });
    });

    describe('handleClosure', () => {
        it('updates obs status and does not try to reconnect if obs is disabled', () => {
            replicants.obsState = {
                enabled: false,
                status: ObsStatus.CONNECTED
            };
            jest.spyOn(service, 'startReconnecting');

            service['handleClosure'](new OBSWebSocketError(9999, 'message'));

            expect(replicants.obsState).toEqual({
                enabled: false,
                status: ObsStatus.NOT_CONNECTED
            });
            expect(service.startReconnecting).not.toHaveBeenCalled();
        });

        it('updates obs status and tries to reconnect if obs is enabled', () => {
            replicants.obsState = {
                enabled: true,
                status: ObsStatus.CONNECTED
            };
            jest.spyOn(service, 'startReconnecting');

            service['handleClosure'](new OBSWebSocketError(9999, 'message'));

            expect(replicants.obsState).toEqual({
                enabled: true,
                status: ObsStatus.NOT_CONNECTED
            });
            expect(service.startReconnecting).toHaveBeenCalled();
        });

        it.each([
            ObsStatus.CONNECTING,
            ObsStatus.NOT_CONNECTED
        ])('does nothing if obs status is %s', status => {
            replicants.obsState = {
                enabled: true,
                status
            };
            jest.spyOn(service, 'startReconnecting');

            service['handleClosure'](new OBSWebSocketError(9999, 'message'));

            expect(replicants.obsState).toEqual({
                enabled: true,
                status
            });
            expect(service.startReconnecting).not.toHaveBeenCalled();
        });
    });

    describe('handleIdentification', () => {
        it('loads required data from obs', async () => {
            jest.spyOn(OBSWebSocket.prototype, 'call').mockResolvedValue({
                currentSceneCollectionName: 'test-scene-collection',
                sceneCollections: []
            });
            jest.spyOn(service as any, 'loadState').mockResolvedValue(null);
            jest.spyOn(service as any, 'loadScreenshotImageFormat').mockResolvedValue(null);

            await service['handleIdentification']();

            expect(service['loadScreenshotImageFormat']).toHaveBeenCalled();
            expect(service['loadState']).toHaveBeenCalledWith('test-scene-collection');
        });
    });

    describe('handleSceneCollectionChange', () => {
        it('loads required data from obs', () => {
            jest.spyOn(service as any, 'loadState').mockResolvedValue(null);

            service['handleSceneCollectionChange']({ sceneCollectionName: 'new-scene-collection' });

            expect(service['loadState']).toHaveBeenCalledWith('new-scene-collection');
        });
    });

    describe('loadState', () => {
        it('updates the state replicant', async () => {
            replicants.obsState = {
                enabled: true,
                status: ObsStatus.CONNECTED
            };
            jest.spyOn(service as any, 'getScenes').mockResolvedValue({
                currentScene: 'scene1',
                scenes: ['scene1', 'scene2']
            });
            jest.spyOn(service as any, 'getInputs').mockResolvedValue([
                { name: 'test-input-1' },
                { name: 'test-input-2' }
            ]);

            await service['loadState']('test-scene-collection');

            expect(replicants.obsState).toEqual({
                enabled: true,
                status: ObsStatus.CONNECTED,
                currentScene: 'scene1',
                scenes: ['scene1', 'scene2'],
                currentSceneCollection: 'test-scene-collection',
                inputs: [
                    { name: 'test-input-1' },
                    { name: 'test-input-2' }
                ]
            });
        });
    });

    describe('handleOpening', () => {
        it('updates status and stops reconnecting', () => {
            jest.spyOn(service, 'stopReconnecting');

            service['handleOpening']();

            expect(service.stopReconnecting).toHaveBeenCalled();
            expect(replicants.obsState).toEqual({
                enabled: false,
                status: ObsStatus.CONNECTED
            });
        });
    });

    describe('handleInputCreation', () => {
        it('handles the list of inputs being empty', () => {
            (replicants.obsState as ObsState).inputs = null;

            // @ts-ignore
            service['handleInputCreation']({
                inputName: 'test-input',
                inputUuid: 'test-uuid-1234',
                inputKind: 'video-input'
            });

            expect((replicants.obsState as ObsState).inputs).toEqual([{
                name: 'test-input',
                uuid: 'test-uuid-1234',
                noVideoOutput: false
            }]);
        });
        
        it('adds a new input to the list', () => {
            (replicants.obsState as ObsState).inputs = [{
                name: 'test-input',
                uuid: 'test-uuid-1234',
                noVideoOutput: true
            }];

            // @ts-ignore
            service['handleInputCreation']({
                inputName: 'new-test-input',
                inputUuid: 'test-uuid-3456',
                inputKind: 'video-input'
            });

            expect((replicants.obsState as ObsState).inputs).toEqual([
                {
                    name: 'test-input',
                    uuid: 'test-uuid-1234',
                    noVideoOutput: true
                },
                {
                    name: 'new-test-input',
                    uuid: 'test-uuid-3456',
                    noVideoOutput: false
                }
            ]);
        });
    });

    describe('handleInputRemoval', () => {
        it('removes the given input from the list', () => {
            (replicants.obsState as ObsState).inputs = [
                {
                    name: 'test-input',
                    uuid: 'test-uuid-1234',
                    noVideoOutput: true
                },
                {
                    name: 'test-input-2',
                    uuid: 'test-uuid-2346',
                    noVideoOutput: false
                },
                {
                    name: 'test-input-3',
                    uuid: 'test-uuid-8367',
                    noVideoOutput: false
                }
            ];

            service['handleInputRemoval']({
                inputUuid: 'test-uuid-2346',
                inputName: 'test-input-2'
            });

            expect((replicants.obsState as ObsState).inputs).toEqual([
                {
                    name: 'test-input',
                    uuid: 'test-uuid-1234',
                    noVideoOutput: true
                },
                {
                    name: 'test-input-3',
                    uuid: 'test-uuid-8367',
                    noVideoOutput: false
                }
            ]);
        });
    });

    describe('handleInputNameChange', () => {
        it('updates the list of inputs', () => {
            (replicants.obsState as ObsState).inputs = [
                {
                    name: 'test-input',
                    uuid: 'test-uuid-1234',
                    noVideoOutput: true
                },
                {
                    name: 'test-input-2',
                    uuid: 'test-uuid-2346',
                    noVideoOutput: false
                },
                {
                    name: 'test-input-3',
                    uuid: 'test-uuid-8367',
                    noVideoOutput: false
                }
            ];

            service['handleInputNameChange']({
                oldInputName: 'test-input-2',
                inputName: 'new-test-input-2',
                inputUuid: 'test-uuid-2346'
            });

            expect((replicants.obsState as ObsState).inputs).toEqual([
                {
                    name: 'test-input',
                    uuid: 'test-uuid-1234',
                    noVideoOutput: true
                },
                {
                    name: 'new-test-input-2',
                    uuid: 'test-uuid-2346',
                    noVideoOutput: false
                },
                {
                    name: 'test-input-3',
                    uuid: 'test-uuid-8367',
                    noVideoOutput: false
                }
            ]);
        });

        it('updates the gameplay input name if required', () => {
            jest.spyOn(service, 'findCurrentConfig').mockReturnValue({
                sceneCollection: 'test-scene-collection',
                gameplayInput: 'test-gameplay-input'
            });
            jest.spyOn(service, 'updateConfig').mockReturnValue(undefined);

            service['handleInputNameChange']({
                oldInputName: 'test-gameplay-input',
                inputName: 'new-test-gameplay-input',
                inputUuid: 'test-uuid-7462'
            });

            expect(service.updateConfig).toHaveBeenCalledWith({
                sceneCollection: 'test-scene-collection',
                gameplayInput: 'new-test-gameplay-input'
            });
        });
    });

    describe('handleSceneCreation', () => {
        it('ignores groups', () => {
            replicants.obsState = {
                scenes: ['scene1']
            };

            service['handleSceneCreation']({
                isGroup: true,
                sceneName: 'scene2',
                sceneUuid: 'test-uuid'
            });

            expect(replicants.obsState).toEqual({
                scenes: ['scene1']
            });
        });

        it('updates the list of scenes', () => {
            replicants.obsState = {
                scenes: ['scene1']
            };

            service['handleSceneCreation']({
                isGroup: false,
                sceneName: 'scene2',
                sceneUuid: 'test-uuid'
            });

            expect(replicants.obsState).toEqual({
                scenes: ['scene1', 'scene2']
            });
        });

        it('handles the list of scenes being missing', () => {
            replicants.obsState = {
                scenes: undefined
            };

            service['handleSceneCreation']({
                isGroup: false,
                sceneName: 'scene2',
                sceneUuid: 'test-uuid'
            });

            expect(replicants.obsState).toEqual({
                scenes: ['scene2']
            });
        });
    });

    describe('handleSceneRemoval', () => {
        it('updates state', () => {
            replicants.obsState = {
                scenes: ['scene1', 'scene2', 'scene3']
            };

            service['handleSceneRemoval']({
                sceneName: 'scene2',
                sceneUuid: 'test-uuid',
                isGroup: false
            });

            expect(replicants.obsState).toEqual({
                scenes: ['scene1', 'scene3']
            });
        });
    });

    describe('handleSceneNameChange', () => {
        it('updates state', () => {
            replicants.obsState = {
                scenes: ['scene1', 'scene2', 'scene3']
            };
            jest.spyOn(service, 'updateConfig').mockReturnValue(undefined);

            service['handleSceneNameChange']({
                sceneName: 'scene2-new',
                oldSceneName: 'scene2',
                sceneUuid: 'test-uuid'
            });

            expect(service.updateConfig).not.toHaveBeenCalled();
            expect(replicants.obsState).toEqual({
                scenes: ['scene1', 'scene2-new', 'scene3']
            });
        });

        it('updates config if needed', () => {
            jest.spyOn(service, 'findCurrentConfig').mockReturnValue({
                sceneCollection: 'test-scene-collection',
                gameplayScene: 'test-renamed-scene',
                intermissionScene: 'test-renamed-scene'
            });
            jest.spyOn(service, 'updateConfig').mockReturnValue(undefined);

            service['handleSceneNameChange']({
                oldSceneName: 'test-renamed-scene',
                sceneName: 'new-test-renamed-scene',
                sceneUuid: 'test-uuid-7462'
            });

            expect(service.updateConfig).toHaveBeenCalledWith({
                sceneCollection: 'test-scene-collection',
                gameplayScene: 'new-test-renamed-scene',
                intermissionScene: 'new-test-renamed-scene'
            });
        });
    });

    describe('handleProgramSceneChange', () => {
        it('updates scenes', () => {
            // @ts-ignore
            service['handleProgramSceneChange']({
                sceneName: 'new-scene'
            });

            expect(replicants.obsState).toEqual({
                enabled: false,
                currentScene: 'new-scene'
            });
        });
    });

    describe('connect', () => {
        it('connects to the obs socket', async () => {
            replicants.obsCredentials = {
                address: 'wss://obs-socket',
                password: 'test pwd'
            };

            await service.connect();

            expect(replicants.obsState).toEqual({ enabled: false, status: ObsStatus.CONNECTING });
            expect(OBSWebSocket.prototype.disconnect).toHaveBeenCalled();
            expect(OBSWebSocket.prototype.connect).toHaveBeenCalledWith('wss://obs-socket', 'test pwd');
        });

        it('adds missing protocol to socket address', async () => {
            replicants.obsCredentials = {
                address: 'localhost:4455',
                password: 'test pwd'
            };

            await service.connect();

            expect(replicants.obsState).toEqual({ enabled: false, status: ObsStatus.CONNECTING });
            expect(OBSWebSocket.prototype.disconnect).toHaveBeenCalled();
            expect(OBSWebSocket.prototype.connect).toHaveBeenCalledWith('ws://localhost:4455', 'test pwd');
        });

        it('starts reconnecting on connection failure', async () => {
            replicants.obsCredentials = {
                address: 'wss://obs-socket',
                password: 'test pwd'
            };
            const error = new Error('test error');
            Object.defineProperty(error, 'code', { value: 10000 });
            jest.spyOn(OBSWebSocket.prototype, 'connect').mockRejectedValue(error);
            jest.spyOn(service, 'startReconnecting');

            await expect(() => service.connect()).rejects.toThrow(new Error('translation:obs.obsConnectionFailed'));

            expect(replicants.obsState).toEqual({ enabled: false, status: ObsStatus.NOT_CONNECTED });
            expect(OBSWebSocket.prototype.disconnect).toHaveBeenCalled();
            expect(OBSWebSocket.prototype.connect).toHaveBeenCalledWith('wss://obs-socket', 'test pwd');
            expect(service.startReconnecting).toHaveBeenCalledWith(10000);
        });

        it('does not start reconnecting on error if specified in arguments', async () => {
            replicants.obsCredentials = {
                address: 'wss://obs-socket',
                password: 'test pwd'
            };
            jest.spyOn(OBSWebSocket.prototype, 'connect').mockRejectedValue(new Error('test error'));
            jest.spyOn(service, 'startReconnecting');

            await expect(() => service.connect(false))
                .rejects.toThrow(new Error('translation:obs.obsConnectionFailed'));

            expect(replicants.obsState).toEqual({ enabled: false, status: ObsStatus.NOT_CONNECTED });
            expect(OBSWebSocket.prototype.disconnect).toHaveBeenCalled();
            expect(OBSWebSocket.prototype.connect).toHaveBeenCalledWith('wss://obs-socket', 'test pwd');
            expect(service.startReconnecting).not.toHaveBeenCalled();
        });
    });

    describe('disconnect', () => {
        it('disconnects from socket and stops reconnecting', async () => {
            jest.spyOn(service, 'stopReconnecting');

            await service.disconnect();

            expect(service.stopReconnecting).toHaveBeenCalled();
            expect(OBSWebSocket.prototype.disconnect).toHaveBeenCalled();
        });
    });

    describe('getInputs', () => {
        it('loads the list of inputs', async () => {
            jest.spyOn(OBSWebSocket.prototype, 'call').mockResolvedValue({
                inputs: [
                    {
                        inputName: 'test-input-1',
                        inputUuid: 'test-uuid-1',
                        inputKind: 'test-video-input'
                    },
                    {
                        inputName: 'test-input-2',
                        inputUuid: 'test-uuid-2',
                        inputKind: 'test-video-input'
                    },
                    {
                        inputName: 'test-input-3',
                        inputUuid: 'test-uuid-3',
                        inputKind: 'sck_audio_capture'
                    }
                ]
            });

            const result = await service['getInputs']();

            expect(result).toEqual([
                {
                    name: 'test-input-1',
                    uuid: 'test-uuid-1',
                    noVideoOutput: false
                },
                {
                    name: 'test-input-2',
                    uuid: 'test-uuid-2',
                    noVideoOutput: false
                },
                {
                    name: 'test-input-3',
                    uuid: 'test-uuid-3',
                    noVideoOutput: true
                }
            ]);
            expect(OBSWebSocket.prototype.call).toHaveBeenCalledWith('GetInputList');
        });
    });

    describe('getScenes', () => {
        it('loads the list of scenes', async () => {
            // @ts-ignore
            jest.spyOn(OBSWebSocket.prototype, 'call').mockResolvedValue({
                currentProgramSceneName: 'scene1',
                scenes: [
                    { sceneName: 'scene1' },
                    { sceneName: 'scene2' },
                    { sceneName: 'scene3' }
                ]
            });

            const result = await service['getScenes']();

            expect(OBSWebSocket.prototype.call).toHaveBeenCalledWith('GetSceneList');
            expect(result).toEqual({
                currentScene: 'scene1',
                scenes: ['scene1', 'scene2', 'scene3']
            });
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
            jest.spyOn(service, 'stopReconnecting');
            jest.spyOn(global, 'setInterval');

            service.startReconnecting(code);

            expect(service.stopReconnecting).not.toHaveBeenCalled();
            expect(global.setInterval).not.toHaveBeenCalled();
        });

        it('sets an interval to reconnect to the socket', () => {
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
            const interval = 'interval (test)';
            (service as any).reconnectionInterval = interval;
            jest.spyOn(global, 'clearInterval');

            service.stopReconnecting();

            expect(clearInterval).toHaveBeenCalledWith(interval);
            expect((service as any).reconnectionInterval).toBeNull();
        });
    });

    describe('getSourceScreenshot', () => {
        it.each([
            ObsStatus.NOT_CONNECTED,
            ObsStatus.CONNECTING
        ])('throws an error if the obs socket status is %s', async (status) => {
            (replicants.obsState as ObsState).status = status;

            await expect(service.getSourceScreenshot('test-source')).rejects.toThrow(new Error('translation:obs.socketNotOpen'));
        });

        it('throws an error if the screenshot image format is unknown', async () => {
            (replicants.obsState as ObsState).status = ObsStatus.CONNECTED;
            service['screenshotImageFormat'] = null;

            await expect(service.getSourceScreenshot('test-source')).rejects.toThrow(new Error('translation:obs.missingScreenshotImageFormat'));
        });

        it('requests a source screenshot from obs', async () => {
            jest.spyOn(OBSWebSocket.prototype, 'call').mockResolvedValue({
                imageData: 'data:image/webp;base64,dGVzdHRlc3Q'
            });
            (Sharp as unknown as jest.Mock).mockReturnValue('test-sharp-result');
            (replicants.obsState as ObsState).status = ObsStatus.CONNECTED;
            service['screenshotImageFormat'] = 'webp';

            const result = await service.getSourceScreenshot('Test Source');

            expect(result).toEqual('test-sharp-result');
            expect(Sharp).toHaveBeenCalledWith(Buffer.from('dGVzdHRlc3Q', 'base64'));
            expect(OBSWebSocket.prototype.call).toHaveBeenCalledWith('GetSourceScreenshot', {
                sourceName: 'Test Source',
                imageFormat: 'webp'
            });
        });
    });

    describe('findConfig', () => {
        it('finds configuration for the given scene collection', () => {
            const config = [
                { sceneCollection: 'test-sc-1', gameplayScene: 'test-gameplay-scene' },
                { sceneCollection: 'test-sc-2', intermissionScene: 'test-intermission-scene' },
                { sceneCollection: 'test-sc-3', gameplayScene: 'test-gameplay-scene', intermissionScene: 'test-intermission-scene' }
            ];
            replicants.obsConfig = config;

            expect(service['findConfig']('test-sc-1')).toEqual(config[0]);
            expect(service['findConfig']('test-sc-2')).toEqual(config[1]);
            expect(service['findConfig'](undefined)).toBeUndefined();
        });
    });

    describe('findCurrentConfig', () => {
        it('gets the config for the current scene collection', () => {
            const config = [
                { sceneCollection: 'test-sc-1', gameplayScene: 'test-gameplay-scene' },
                { sceneCollection: 'test-sc-2', intermissionScene: 'test-intermission-scene' },
                { sceneCollection: 'test-sc-3', gameplayScene: 'test-gameplay-scene', intermissionScene: 'test-intermission-scene' }
            ];
            replicants.obsConfig = config;
            replicants.obsState = { currentSceneCollection: 'test-sc-3' };

            expect(service.findCurrentConfig()).toEqual(config[2]);
        });
    });
});
