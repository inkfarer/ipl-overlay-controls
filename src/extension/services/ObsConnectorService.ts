import type NodeCG from '@nodecg/types';
import { ObsConfig, ObsConfigItem, ObsCredentials, ObsState } from 'schemas';
import OBSWebSocket, { EventTypes } from 'obs-websocket-js';
import { ObsStatus } from 'types/enums/ObsStatus';
import { isBlank } from '../../helpers/stringHelper';
import i18next from 'i18next';
import Sharp from 'sharp';

// Authentication failed, Unsupported protocol version, Session invalidated
const SOCKET_CLOSURE_CODES_FORBIDDING_RECONNECTION = [4009, 4010, 4011];
const SUPPORTED_SCREENSHOT_IMAGE_FORMATS = ['webp', 'jpg', 'jpeg', 'png', 'tiff'] as const;
type ScreenshotImageFormat = typeof SUPPORTED_SCREENSHOT_IMAGE_FORMATS[number];
// Checked from OBS's source - Under each source's 'obs_source_info' struct, the output_flags property defines if a
// source outputs video or not. The websocket doesn't expose these details by itself...
const OBS_INPUT_KINDS_WITHOUT_VIDEO = [
    'sck_audio_capture',
    'coreaudio_input_capture',
    'coreaudio_output_capture',
    'oss_input_capture',
    'pulse_input_capture',
    'pulse_output_capture',
    'alsa_input_capture',
    'jack_output_capture',
    'audio_line',
    'sndio_output_capture'
];

export class ObsConnectorService {
    private readonly nodecg: NodeCG.ServerAPI;
    private obsState: NodeCG.ServerReplicant<ObsState>;
    private obsCredentials: NodeCG.ServerReplicant<ObsCredentials>;
    private obsConfig: NodeCG.ServerReplicant<ObsConfig>;
    private socket: OBSWebSocket;
    private reconnectionInterval: NodeJS.Timeout;
    private reconnectionCount: number;
    private screenshotImageFormat: ScreenshotImageFormat | null;

    constructor(nodecg: NodeCG.ServerAPI) {
        this.nodecg = nodecg;
        this.obsState = nodecg.Replicant('obsState');
        this.obsCredentials = nodecg.Replicant('obsCredentials');
        this.obsConfig = nodecg.Replicant('obsConfig');
        this.socket = new OBSWebSocket();
        this.reconnectionCount = 0;
        this.screenshotImageFormat = null;

        this.socket.on('ConnectionClosed', e => this.handleClosure(e))
            .on('ConnectionOpened', () => this.handleOpening())
            .on('Identified', () => {
                this.handleIdentification().catch(e => {
                    this.nodecg.log.error(i18next.t('obs.errorAfterSocketOpen'), e);
                });
            })
            .on('CurrentProgramSceneChanged', e => this.handleProgramSceneChange(e))
            .on('CurrentSceneCollectionChanged', this.handleSceneCollectionChange.bind(this));

        if (this.obsState.value.enabled) {
            this.connect().catch(e => {
                nodecg.log.error(i18next.t('obs.errorWhileConnecting'), e.toString());
            });
        }
    }

    updateConfig(config: ObsConfigItem): void {
        const existingIndex = this.obsConfig.value.findIndex(item => item.sceneCollection === config.sceneCollection);

        if (existingIndex === -1) {
            this.obsConfig.value.push(config);
        } else {
            this.obsConfig.value[existingIndex] = config;
        }
    }

    private handleClosure(event: EventTypes['ConnectionClosed']): void {
        if (this.obsState.value.status === ObsStatus.CONNECTED) {
            if (event.code !== 1000) {
                this.nodecg.log.error(i18next.t('obs.socketClosed', { message: event.message }));
            }
            this.obsState.value.status = ObsStatus.NOT_CONNECTED;
            if (this.obsState.value.enabled) {
                this.startReconnecting(event.code);
            }
        }

        this.socket
            .off('SceneCreated')
            .off('SceneRemoved')
            .off('SceneNameChanged')
            .off('InputCreated')
            .off('InputRemoved')
            .off('InputNameChanged');
    }

    private async handleIdentification(): Promise<void> {
        await this.loadScreenshotImageFormat();

        const sceneCollections = await this.socket.call('GetSceneCollectionList');
        await this.loadState(sceneCollections.currentSceneCollectionName);

        this.socket
            .on('SceneCreated', this.handleSceneCreation.bind(this))
            .on('SceneRemoved', this.handleSceneRemoval.bind(this))
            .on('SceneNameChanged', this.handleSceneNameChange.bind(this))
            .on('InputCreated', this.handleInputCreation.bind(this))
            .on('InputRemoved', this.handleInputRemoval.bind(this))
            .on('InputNameChanged', this.handleInputNameChange.bind(this));
    }

    private handleSceneCollectionChange(event: EventTypes['CurrentSceneCollectionChanged']): void {
        this.loadState(event.sceneCollectionName).catch(e => {
            this.nodecg.log.error(i18next.t('obs.errorAfterSceneCollectionChange'), e);
        });
    }

    private async loadState(currentSceneCollection: string): Promise<void> {
        const scenes = await this.getScenes();
        const inputs = await this.getInputs();

        this.obsState.value = {
            ...this.obsState.value,
            scenes: scenes.scenes,
            currentScene: scenes.currentScene,
            currentSceneCollection,
            inputs
        };
    }

    private handleOpening(): void {
        this.nodecg.log.info(i18next.t('obs.socketOpen'));
        this.obsState.value.status = ObsStatus.CONNECTED;
        this.stopReconnecting();
    }

    private async loadScreenshotImageFormat(): Promise<void> {
        const version = await this.socket.call('GetVersion');
        for (const format of SUPPORTED_SCREENSHOT_IMAGE_FORMATS) {
            if (version.supportedImageFormats.includes(format)) {
                this.screenshotImageFormat = format;
                return;
            }
        }
        this.screenshotImageFormat = null;
    }

    // region Inputs
    private handleInputCreation(event: EventTypes['InputCreated']): void {
        if (this.obsState.value.inputs == null) {
            this.obsState.value.inputs = [{
                name: event.inputName,
                uuid: event.inputUuid,
                noVideoOutput: OBS_INPUT_KINDS_WITHOUT_VIDEO.includes(event.inputKind)
            }];
        } else {
            this.obsState.value.inputs.push({
                name: event.inputName,
                uuid: event.inputUuid,
                noVideoOutput: OBS_INPUT_KINDS_WITHOUT_VIDEO.includes(event.inputKind)
            });
        }
    }

    private handleInputRemoval(event: EventTypes['InputRemoved']): void {
        if (this.obsState.value.inputs != null) {
            this.obsState.value.inputs = this.obsState.value.inputs.filter(input => input.name !== event.inputName);
        }
    }

    private handleInputNameChange(event: EventTypes['InputNameChanged']): void {
        if (this.obsState.value.inputs != null) {
            this.obsState.value.inputs = this.obsState.value.inputs.map(input => {
                if (input.name === event.oldInputName) {
                    return {
                        ...input,
                        name: event.inputName
                    };
                }

                return input;
            });
        }

        const config = this.findCurrentConfig();
        if (event.oldInputName === config?.gameplayInput) {
            this.updateConfig({
                ...config,
                gameplayInput: event.inputName
            });
        }
    }

    private async getInputs(): Promise<ObsState['inputs']> {
        const inputs = await this.socket.call('GetInputList');
        return inputs.inputs.map(input => ({
            name: String(input.inputName),
            uuid: input.inputUuid == null ? null : String(input.inputUuid),
            noVideoOutput: OBS_INPUT_KINDS_WITHOUT_VIDEO.includes(String(input.inputKind))
        }));
    }
    // endregion

    // region Scenes
    private handleSceneCreation(event: EventTypes['SceneCreated']): void {
        if (event.isGroup) return;

        if (this.obsState.value.scenes == null) {
            this.obsState.value.scenes = [event.sceneName];
        } else {
            this.obsState.value.scenes.push(event.sceneName);
        }
    }

    private handleSceneRemoval(event: EventTypes['SceneRemoved']): void {
        if (!event.isGroup && this.obsState.value.scenes != null) {
            this.obsState.value.scenes = this.obsState.value.scenes.filter(scene => scene !== event.sceneName);
        }
    }

    private handleSceneNameChange(event: EventTypes['SceneNameChanged']): void {
        if (this.obsState.value.scenes != null) {
            this.obsState.value.scenes = this.obsState.value.scenes.map(scene =>
                scene === event.oldSceneName ? event.sceneName : scene);
        }

        const config = this.findCurrentConfig();
        if (config != null) {
            const configUpdates: Record<string, string | undefined> = { };
            for (const scene of ['gameplayScene', 'intermissionScene'] as (keyof ObsConfigItem)[]) {
                if (config[scene] === event.oldSceneName) {
                    configUpdates[scene] = event.sceneName;
                }
            }

            if (Object.keys(configUpdates).length > 0) {
                this.updateConfig({
                    ...config,
                    ...configUpdates
                });
            }
        }
    }

    private handleProgramSceneChange(event: EventTypes['CurrentProgramSceneChanged']): void {
        this.obsState.value.currentScene = event.sceneName;
    }

    private async getScenes(): Promise<{ currentScene: string, scenes: string[] }> {
        const sceneList = await this.socket.call('GetSceneList');
        const scenes = sceneList.scenes.map(scene => String(scene.sceneName));

        return {
            currentScene: sceneList.currentProgramSceneName,
            scenes
        };
    }

    setCurrentScene(scene: string): Promise<void> {
        return this.socket.call('SetCurrentProgramScene', { sceneName: scene });
    }
    // endregion

    async connect(reconnectOnFailure = true): Promise<void> {
        await this.socket.disconnect();
        this.obsState.value.status = ObsStatus.CONNECTING;

        const address = this.obsCredentials.value.address.indexOf('://') === -1
            ? `ws://${this.obsCredentials.value.address}`
            : this.obsCredentials.value.address;
        try {
            await this.socket.connect(
                address,
                isBlank(this.obsCredentials.value.password) ? undefined : this.obsCredentials.value.password);
        } catch (e) {
            this.obsState.value.status = ObsStatus.NOT_CONNECTED;
            if (reconnectOnFailure) {
                this.startReconnecting(e.code);
            }
            throw new Error(i18next.t('obs.obsConnectionFailed', { message: e.message ?? String(e) }));
        }
    }

    async disconnect(): Promise<void> {
        this.stopReconnecting();
        await this.socket.disconnect();
    }

    startReconnecting(socketClosureCode?: number): void {
        if (SOCKET_CLOSURE_CODES_FORBIDDING_RECONNECTION.includes(socketClosureCode)) return;

        this.stopReconnecting();
        this.reconnectionInterval = setInterval(() => {
            this.reconnectionCount++;
            if (this.reconnectionCount === 1) {
                this.nodecg.log.info(i18next.t('obs.reconnectingToSocket'));
            }
            this.connect(false).catch(() => {
                // ignore
            });
        }, 10000);
    }

    stopReconnecting(): void {
        clearInterval(this.reconnectionInterval);
        this.reconnectionInterval = null;
        this.reconnectionCount = 0;
    }

    async getSourceScreenshot(source: string): Promise<Sharp.Sharp> {
        if (this.obsState.value.status !== ObsStatus.CONNECTED) {
            throw new Error(i18next.t('obs.socketNotOpen'));
        }
        if (this.screenshotImageFormat == null) {
            throw new Error(i18next.t('obs.missingScreenshotImageFormat'));
        }

        const response = await this.socket.call('GetSourceScreenshot', {
            sourceName: source,
            imageFormat: this.screenshotImageFormat
        });
        const base64WithoutHeader = response.imageData.substring(response.imageData.indexOf(',') + 1);
        const buffer = Buffer.from(base64WithoutHeader, 'base64');

        return Sharp(buffer);
    }

    private findConfig(sceneCollection: string | undefined): ObsConfigItem | undefined {
        if (sceneCollection == null) {
            return undefined;
        }

        return this.obsConfig.value.find(item => item.sceneCollection === sceneCollection);
    }

    findCurrentConfig(): ObsConfigItem | undefined {
        return this.findConfig(this.obsState.value.currentSceneCollection);
    }
}
