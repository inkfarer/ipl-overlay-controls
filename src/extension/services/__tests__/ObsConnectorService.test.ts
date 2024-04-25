import { ObsConnectorService } from '../ObsConnectorService';
import { mockNodecg, replicants } from '../../__mocks__/mockNodecg';
import OBSWebSocket, { OBSWebSocketError } from 'obs-websocket-js';
import { ObsStatus } from 'types/enums/ObsStatus';
import { ObsData } from 'schemas';
import { flushPromises } from '@vue/test-utils';
import Sharp from 'sharp';

jest.mock('sharp');

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

    describe('handleIdentification', () => {
        it('loads required data from obs', () => {
            const service = new ObsConnectorService(mockNodecg);
            jest.spyOn(service as any, 'loadSceneList').mockResolvedValue(null);
            jest.spyOn(service as any, 'getScreenshotImageFormat').mockResolvedValue(null);
            jest.spyOn(service as any, 'loadInputs').mockResolvedValue(null);

            service['handleIdentification']();

            expect(service['loadSceneList']).toHaveBeenCalledTimes(1);
            expect(service['getScreenshotImageFormat']).toHaveBeenCalledTimes(1);
            expect(service['loadInputs']).toHaveBeenCalledTimes(1);
        });
    });

    describe('handleSceneCollectionChange', () => {
        it('loads required data from obs', () => {
            const service = new ObsConnectorService(mockNodecg);
            jest.spyOn(service as any, 'loadSceneList').mockResolvedValue(null);
            jest.spyOn(service as any, 'loadInputs').mockResolvedValue(null);

            service['handleSceneCollectionChange']();

            expect(service['loadSceneList']).toHaveBeenCalledTimes(1);
            expect(service['loadInputs']).toHaveBeenCalledTimes(1);
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

    describe('handleInputCreation', () => {
        it('handles the list of inputs being empty', () => {
            (replicants.obsData as ObsData).inputs = null;
            const service = new ObsConnectorService(mockNodecg);

            // @ts-ignore
            service['handleInputCreation']({
                inputName: 'test-input',
                inputUuid: 'test-uuid-1234',
                inputKind: 'video-input'
            });

            expect((replicants.obsData as ObsData).inputs).toEqual([{
                name: 'test-input',
                uuid: 'test-uuid-1234',
                noVideoOutput: false
            }]);
        });
        
        it('adds a new input to the list', () => {
            (replicants.obsData as ObsData).inputs = [{
                name: 'test-input',
                uuid: 'test-uuid-1234',
                noVideoOutput: true
            }];
            const service = new ObsConnectorService(mockNodecg);

            // @ts-ignore
            service['handleInputCreation']({
                inputName: 'new-test-input',
                inputUuid: 'test-uuid-3456',
                inputKind: 'video-input'
            });

            expect((replicants.obsData as ObsData).inputs).toEqual([
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
            (replicants.obsData as ObsData).inputs = [
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
            const service = new ObsConnectorService(mockNodecg);

            service['handleInputRemoval']({
                inputUuid: 'test-uuid-2346',
                inputName: 'test-input-2'
            });

            expect((replicants.obsData as ObsData).inputs).toEqual([
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

        it('unsets the gameplay input if it was deleted', () => {
            (replicants.obsData as ObsData).gameplayInput = 'test-gameplay-input';
            const service = new ObsConnectorService(mockNodecg);

            service['handleInputRemoval']({
                inputName: 'test-gameplay-input',
                inputUuid: 'test-uuid-3584'
            });

            expect((replicants.obsData as ObsData).gameplayInput).toBeUndefined();
        });
    });

    describe('handleInputNameChange', () => {
        it('updates the list of inputs', () => {
            (replicants.obsData as ObsData).inputs = [
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
            const service = new ObsConnectorService(mockNodecg);

            service['handleInputNameChange']({
                oldInputName: 'test-input-2',
                inputName: 'new-test-input-2',
                inputUuid: 'test-uuid-2346'
            });

            expect((replicants.obsData as ObsData).inputs).toEqual([
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
            (replicants.obsData as ObsData).gameplayInput = 'test-gameplay-input';
            const service = new ObsConnectorService(mockNodecg);

            service['handleInputNameChange']({
                oldInputName: 'test-gameplay-input',
                inputName: 'new-test-gameplay-input',
                inputUuid: 'test-uuid-7462'
            });

            expect((replicants.obsData as ObsData).gameplayInput).toEqual('new-test-gameplay-input');
        });
    });

    describe('handleProgramSceneChange', () => {
        it('updates scenes', () => {
            const service = new ObsConnectorService(mockNodecg);

            // @ts-ignore
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
        it('connects to the obs socket', async () => {
            replicants.obsCredentials = {
                address: 'wss://obs-socket',
                password: 'test pwd'
            };
            const service = new ObsConnectorService(mockNodecg);

            await service.connect();

            expect(replicants.obsData).toEqual({ enabled: false, status: ObsStatus.CONNECTING });
            expect(OBSWebSocket.prototype.disconnect).toHaveBeenCalled();
            expect(OBSWebSocket.prototype.connect).toHaveBeenCalledWith('wss://obs-socket', 'test pwd');
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

            await expect(() => service.connect()).rejects.toThrow(new Error('translation:obs.obsConnectionFailed'));

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
                .rejects.toThrow(new Error('translation:obs.obsConnectionFailed'));

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

    describe('loadInputs', () => {
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
            const service = new ObsConnectorService(mockNodecg);

            await service['loadInputs']();

            expect((replicants.obsData as ObsData).inputs).toEqual([
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

        it('unsets the gameplay input if it does not exist in obs', async () => {
            (replicants.obsData as ObsData).gameplayInput = 'test-input-4';
            jest.spyOn(OBSWebSocket.prototype, 'call').mockResolvedValue({
                inputs: [
                    {
                        inputName: 'test-input-1',
                        inputUuid: 'test-uuid-1',
                        inputKind: 'test-video-input'
                    }
                ]
            });
            const service = new ObsConnectorService(mockNodecg);

            await service['loadInputs']();

            expect((replicants.obsData as ObsData).gameplayInput).toBeUndefined();
            expect(OBSWebSocket.prototype.call).toHaveBeenCalledWith('GetInputList');
        });
    });

    describe('loadSceneList', () => {
        it('loads and updates scene data', async () => {
            // @ts-ignore
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
            jest.spyOn(global, 'clearInterval');

            service.stopReconnecting();

            expect(clearInterval).toHaveBeenCalledWith(interval);
            expect((service as any).reconnectionInterval).toBeNull();
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

    describe('getSourceScreenshot', () => {
        it.each([
            ObsStatus.NOT_CONNECTED,
            ObsStatus.CONNECTING
        ])('throws an error if the obs socket status is %s', async (status) => {
            (replicants.obsData as ObsData).status = status;
            const service = new ObsConnectorService(mockNodecg);

            await expect(service.getSourceScreenshot('test-source')).rejects.toThrow(new Error('translation:obs.socketNotOpen'));
        });

        it('throws an error if the screenshot image format is unknown', async () => {
            (replicants.obsData as ObsData).status = ObsStatus.CONNECTED;
            const service = new ObsConnectorService(mockNodecg);
            service['screenshotImageFormat'] = null;

            await expect(service.getSourceScreenshot('test-source')).rejects.toThrow(new Error('translation:obs.missingScreenshotImageFormat'));
        });

        it('requests a source screenshot from obs', async () => {
            jest.spyOn(OBSWebSocket.prototype, 'call').mockResolvedValue({
                imageData: 'data:image/webp;base64,dGVzdHRlc3Q'
            });
            (Sharp as unknown as jest.Mock).mockReturnValue('test-sharp-result');
            (replicants.obsData as ObsData).status = ObsStatus.CONNECTED;
            const service = new ObsConnectorService(mockNodecg);
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
});
