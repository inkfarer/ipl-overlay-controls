import * as nodecgContext from '../helpers/nodecg';
import { ObsCredentials, ObsData } from '../../types/schemas';
import OBSWebSocket from 'obs-websocket-js';
import { isBlank } from '../../helpers/stringHelper';
import { ObsStatus } from '../../types/enums/ObsStatus';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import { SetObsDataRequest } from '../../types/messages/obs';
import semver from 'semver/preload';

const nodecg = nodecgContext.get();

const obsCredentials = nodecg.Replicant<ObsCredentials>('obsCredentials');
const obsData = nodecg.Replicant<ObsData>('obsData');
const socket = new OBSWebSocket();
let reconnectionInterval: NodeJS.Timeout;

socket.on('error', e => {
    nodecg.log.error('Received error from OBS websocket:', e);
    reconnect();
});

socket.on('ConnectionClosed', () => {
    if (obsData.value.status === ObsStatus.CONNECTED) {
        nodecg.log.info('OBS websocket is closed.');
        obsData.value.status = ObsStatus.NOT_CONNECTED;
        if (obsData.value.enabled) {
            reconnect();
        }
    }
});

socket.on('ConnectionOpened', () => {
    nodecg.log.info('OBS websocket is open.');
    obsData.value.status = ObsStatus.CONNECTED;
    stopReconnecting();
});

socket.on('ScenesChanged', async (event) => {
    // Older OBS websocket versions do not provide this data.
    if (event.scenes) {
        obsData.value.scenes = event.scenes.map(scene => scene.name);
    } else {
        await fetchObsData();
    }
});

socket.on('SwitchScenes', event => {
    obsData.value.currentScene = event['scene-name'];
});

function reconnect() {
    stopReconnecting();
    reconnectionInterval = setInterval(() => tryToConnect(obsCredentials.value, false), 5000);
}

function stopReconnecting() {
    clearInterval(reconnectionInterval);
    reconnectionInterval = null;
}

async function connect(credentials: ObsCredentials): Promise<void> {
    socket.disconnect();
    obsData.value.status = ObsStatus.CONNECTING;

    try {
        await socket.connect({
            address: credentials.address,
            password: isBlank(credentials.password) ? undefined : credentials.password
        });

        await checkObsVersion();
        await fetchObsData();
    } catch (e) {
        obsData.value.status = ObsStatus.NOT_CONNECTED;
        throw new Error(e.description ?? e.error ?? e);
    }
}

export async function tryToConnect(credentials: ObsCredentials, doLog = true): Promise<void> {
    if (doLog) {
        nodecg.log.info('Connecting to OBS websocket...');
    }
    try {
        await connect(credentials);
    } catch (e) {
        if (doLog) {
            nodecg.log.error('Failed to connect to OBS websocket:', e.message);
        }
        reconnect();
    }
}

async function checkObsVersion(): Promise<void> {
    const versionInfo = await socket.send('GetVersion');
    const socketVersion = semver.parse(versionInfo['obs-websocket-version']);
    if (semver.lt(socketVersion, '4.9.0')) {
        nodecg.log.warn(`Please update your obs-websocket version (Currently ${socketVersion}) as older versions are known to cause unexpected issues.`);
    }
}

async function fetchObsData(): Promise<void> {
    try {
        const scenes = await socket.send('GetSceneList');
        const currentScene = await socket.send('GetCurrentScene');

        obsData.value.currentScene = currentScene.name;
        obsData.value.scenes = scenes.scenes.map(scene => scene.name);
    } catch (e) {
        nodecg.log.error('Failed to get data for scenes:', e.description ?? e.error ?? e);
    }
}

nodecg.listenFor('connectToObs', async (data: ObsCredentials, callback: UnhandledListenForCb) => {
    obsCredentials.value = data;

    if (!obsData.value.enabled) {
        return callback(new Error('OBS integration is disabled.'));
    }

    stopReconnecting();
    try {
        await connect(data);
    } catch (e) {
        reconnect();
        return callback(e);
    }

    callback(null);
});

nodecg.listenFor('setObsData', (data: SetObsDataRequest, callback: UnhandledListenForCb) => {
    if (!obsData.value.scenes?.some(scene => scene === data.gameplayScene)
        || !obsData.value.scenes?.some(scene => scene === data.intermissionScene)) {
        return callback(new Error('Could not find one or more of the provided scenes.'));
    }

    obsData.value = {
        ...obsData.value,
        ...data
    };
    callback();
});

nodecg.listenFor('setObsSocketEnabled', async (enabled: boolean, callback: UnhandledListenForCb) => {
    if (enabled == null) {
        return callback(new Error('Invalid arguments.'));
    }
    obsData.value.enabled = enabled;
    if (!enabled) {
        socket.disconnect();
        stopReconnecting();
    } else {
        await tryToConnect(obsCredentials.value, true);
    }
    callback(null);
});

export async function setCurrentScene(scene: string): Promise<void> {
    return socket.send('SetCurrentScene', { 'scene-name': scene });
}
