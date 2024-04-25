import type NodeCG from '@nodecg/types';
import { ObsCredentials, ObsData } from 'schemas';
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
    private obsData: NodeCG.ServerReplicant<ObsData>;
    private obsCredentials: NodeCG.ServerReplicant<ObsCredentials>;
    private socket: OBSWebSocket;
    private reconnectionInterval: NodeJS.Timeout;
    private reconnectionCount: number;
    private screenshotImageFormat: ScreenshotImageFormat | null;

    constructor(nodecg: NodeCG.ServerAPI) {
        this.nodecg = nodecg;
        this.obsData = nodecg.Replicant('obsData');
        this.obsCredentials = nodecg.Replicant('obsCredentials');
        this.socket = new OBSWebSocket();
        this.reconnectionCount = 0;
        this.screenshotImageFormat = null;

        this.socket.on('ConnectionClosed', e => this.handleClosure(e))
            .on('ConnectionOpened', () => this.handleOpening())
            .on('Identified', () => this.handleIdentification())
            .on('SceneListChanged', e => this.handleSceneListChange(e))
            .on('CurrentProgramSceneChanged', e => this.handleProgramSceneChange(e))
            .on('CurrentSceneCollectionChanged', this.handleSceneCollectionChange.bind(this));

        if (this.obsData.value.enabled) {
            this.connect().catch(e => {
                nodecg.log.error(i18next.t('obs.errorWhileConnecting', { message: e.toString() }));
            });
        }
    }

    private handleClosure(event: EventTypes['ConnectionClosed']): void {
        if (this.obsData.value.status === ObsStatus.CONNECTED) {
            if (event.code !== 1000) {
                this.nodecg.log.error(i18next.t('obs.socketClosed', { message: event.message }));
            }
            this.obsData.value.status = ObsStatus.NOT_CONNECTED;
            if (this.obsData.value.enabled) {
                this.startReconnecting(event.code);
            }
        }

        this.socket
            .off('InputCreated')
            .off('InputRemoved')
            .off('InputNameChanged');
    }

    private handleIdentification(): void {
        Promise.all([
            this.loadSceneList(),
            this.getScreenshotImageFormat(),
            this.loadInputs()
        ]).catch(e => {
            this.nodecg.log.error(i18next.t('obs.errorAfterSocketOpen'), e);
        });
    }

    private handleSceneCollectionChange(): void {
        Promise.all([
            this.loadSceneList(),
            this.loadInputs()
        ]).catch(e => {
            this.nodecg.log.error(i18next.t('obs.errorAfterSceneCollectionChange'), e);
        });
    }

    private handleOpening(): void {
        this.nodecg.log.info(i18next.t('obs.socketOpen'));
        this.obsData.value.status = ObsStatus.CONNECTED;
        this.stopReconnecting();
    }

    private async getScreenshotImageFormat(): Promise<void> {
        const version = await this.socket.call('GetVersion');
        for (const format of SUPPORTED_SCREENSHOT_IMAGE_FORMATS) {
            if (version.supportedImageFormats.includes(format)) {
                this.screenshotImageFormat = format;
                return;
            }
        }
        this.screenshotImageFormat = null;
    }

    private handleSceneListChange(event: EventTypes['SceneListChanged']): void {
        this.updateScenes(event.scenes.map(scene => String(scene.sceneName)));
    }

    private handleInputCreation(event: EventTypes['InputCreated']): void {
        if (this.obsData.value.inputs == null) {
            this.obsData.value.inputs = [{
                name: event.inputName,
                uuid: event.inputUuid,
                noVideoOutput: OBS_INPUT_KINDS_WITHOUT_VIDEO.includes(event.inputKind)
            }];
        } else {
            this.obsData.value.inputs.push({
                name: event.inputName,
                uuid: event.inputUuid,
                noVideoOutput: OBS_INPUT_KINDS_WITHOUT_VIDEO.includes(event.inputKind)
            });
        }
    }

    private handleInputRemoval(event: EventTypes['InputRemoved']): void {
        if (this.obsData.value.inputs != null) {
            this.obsData.value.inputs = this.obsData.value.inputs.filter(input => input.name !== event.inputName);
        }

        if (this.obsData.value.gameplayInput != null && event.inputName === this.obsData.value.gameplayInput) {
            this.obsData.value.gameplayInput = undefined;
        }
    }

    private handleInputNameChange(event: EventTypes['InputNameChanged']): void {
        if (this.obsData.value.inputs != null) {
            this.obsData.value.inputs = this.obsData.value.inputs.map(input => {
                if (input.name === event.oldInputName) {
                    return {
                        ...input,
                        name: event.inputName
                    };
                }

                return input;
            });
        }

        if (this.obsData.value.gameplayInput != null && this.obsData.value.gameplayInput === event.oldInputName) {
            this.obsData.value.gameplayInput = event.inputName;
        }
    }

    private handleProgramSceneChange(event: EventTypes['CurrentProgramSceneChanged']): void {
        this.obsData.value.currentScene = event.sceneName;
    }

    async connect(reconnectOnFailure = true): Promise<void> {
        await this.socket.disconnect();
        this.obsData.value.status = ObsStatus.CONNECTING;

        try {
            // todo: if address does not start with http(s), add it manually (client side?)
            await this.socket.connect(
                this.obsCredentials.value.address,
                isBlank(this.obsCredentials.value.password) ? undefined : this.obsCredentials.value.password);
        } catch (e) {
            this.obsData.value.status = ObsStatus.NOT_CONNECTED;
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

    private async loadInputs(): Promise<void> {
        const inputs = await this.socket.call('GetInputList');
        this.obsData.value.inputs = inputs.inputs.map(input => ({
            name: String(input.inputName),
            uuid: input.inputUuid == null ? null : String(input.inputUuid),
            noVideoOutput: OBS_INPUT_KINDS_WITHOUT_VIDEO.includes(String(input.inputKind))
        }));

        if (
            this.obsData.value.gameplayInput != null
            && !inputs.inputs.some(input => input.inputName === this.obsData.value.gameplayInput)
        ) {
            this.obsData.value.gameplayInput = undefined;
        }

        this.socket
            .on('InputCreated', this.handleInputCreation.bind(this))
            .on('InputRemoved', this.handleInputRemoval.bind(this))
            .on('InputNameChanged', this.handleInputNameChange.bind(this));
    }

    private async loadSceneList(): Promise<void> {
        const scenes = await this.socket.call('GetSceneList');
        this.obsData.value.currentScene = scenes.currentProgramSceneName;
        this.updateScenes(scenes.scenes.map(scene => String(scene.sceneName)));
    }

    startReconnecting(socketClosureCode?: number): void {
        if (SOCKET_CLOSURE_CODES_FORBIDDING_RECONNECTION.includes(socketClosureCode)) return;

        this.stopReconnecting();
        this.reconnectionInterval = setInterval(() => {
            this.reconnectionCount++;
            this.nodecg.log.info(i18next.t('obs.reconnectingToSocket', { count: this.reconnectionCount }));
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

    private updateScenes(scenes: string[]): void {
        // OBS does not allow you to have no scenes.
        if (scenes.length <= 0) {
            this.nodecg.log.error(i18next.t('obs.receivedNoScenes'));
            return;
        }

        const obsDataUpdates: Record<string, unknown> = {};
        if (!scenes.includes(this.obsData.value.gameplayScene)) {
            obsDataUpdates.gameplayScene = scenes[0];
        }
        if (!scenes.includes(this.obsData.value.intermissionScene)) {
            obsDataUpdates.intermissionScene = scenes[scenes.length === 1 ? 0 : 1];
        }
        obsDataUpdates.scenes = scenes;
        this.obsData.value = {
            ...this.obsData.value,
            ...obsDataUpdates
        };

        if (obsDataUpdates.gameplayScene || obsDataUpdates.intermissionScene) {
            this.nodecg.sendMessage('obsSceneConfigurationChangedAfterUpdate');
        }
    }

    setCurrentScene(scene: string): Promise<void> {
        return this.socket.call('SetCurrentProgramScene', { sceneName: scene });
    }

    async getSourceScreenshot(source: string): Promise<Sharp.Sharp> {
        if (this.obsData.value.status !== ObsStatus.CONNECTED) {
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
}
