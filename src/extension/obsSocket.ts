import * as nodecgContext from './helpers/nodecg';
import { ObsCredentials, ObsData } from '../types/schemas';
import OBSWebSocket from 'obs-websocket-js';
import { isBlank } from '../helpers/stringHelper';
import { ObsStatus } from '../types/enums/ObsStatus';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';

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
        reconnect();
    }
});

socket.on('ConnectionOpened', () => {
    nodecg.log.info('Connected to OBS websocket');
    obsData.value.status = ObsStatus.CONNECTED;
    stopReconnecting();
});

socket.on('ScenesChanged', scenes => {
    obsData.value.scenes = scenes.scenes.map(scene => scene.name);
});

socket.on('TransitionListChanged', transitions => {
    obsData.value.transitions = transitions.transitions.map(transition => transition.name);
});

function reconnect() {
    stopReconnecting();
    reconnectionInterval = setInterval(() => connect(obsCredentials.value), 5000);
}

function stopReconnecting() {
    clearInterval(reconnectionInterval);
    reconnectionInterval = null;
}

export async function connect(credentials: ObsCredentials): Promise<void> {
    socket.disconnect();
    obsData.value.status = ObsStatus.CONNECTING;

    nodecg.log.info('Connecting to OBS websocket...');
    try {
        await socket.connect({
            address: credentials.address,
            password: isBlank(credentials.password) ? undefined : credentials.password
        });

        await getScenesAndTransitions();
    } catch (e) {
        nodecg.log.error('Failed to connect to OBS websocket:', e.description ?? e.error ?? e);
        obsData.value.status = ObsStatus.NOT_CONNECTED;
        reconnect();
    }
}

async function getScenesAndTransitions() {
    try {
        const scenes = await socket.send('GetSceneList');
        const transitions = await socket.send('GetTransitionList');

        obsData.value.scenes = scenes.scenes.map(scene => scene.name);
        obsData.value.transitions = transitions.transitions.map(transition => transition.name);
    } catch (e) {
        nodecg.log.error('Failed to get data for scenes and transitions:', e.description ?? e.error ?? e);
    }
}

nodecg.listenFor('connectToObs', async (data: ObsCredentials, callback: UnhandledListenForCb) => {
    obsCredentials.value = data;
    stopReconnecting();
    await connect(data);
    callback();
});
