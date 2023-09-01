import type NodeCG from '@nodecg/types';
import * as nodecgContext from '../helpers/nodecg';
import { PredictionStore, RadiaSettings } from 'schemas';
import {
    PredictionBeginEvent,
    PredictionEndEvent,
    PredictionLockEvent,
    PredictionProgressEvent,
    PredictionResponse
} from 'types/prediction';
import { CreatePrediction, PatchPrediction } from 'types/predictionRequests';
import { createPrediction, getPredictions, hasPredictionSupport, updatePrediction } from './clients/radiaClient';
import WebSocket from 'ws';
import { PredictionDataMapper } from './mappers/predictionDataMapper';
import { RadiaSocketMessage } from '../types/radiaApi';
import { DateTime } from 'luxon';
import isEmpty from 'lodash/isEmpty';

const nodecg = nodecgContext.get();

const radiaSettings = nodecg.Replicant<RadiaSettings>('radiaSettings');
const predictionStore = nodecg.Replicant<PredictionStore>('predictionStore');

let socket: WebSocket;
let socketPingTimeout: NodeJS.Timeout;
let socketReconnectionTimeout: NodeJS.Timeout;
let socketReconnectionCount = 0;
const connectionTimeouts = [1000, 2500, 5000, 10000, 25000];
const maxReconnectionCount = 5;
const pingMessageInterval = 20000;
const expectedSocketClosureCode = 4001;

function initSocket(guildId: string): void {
    clearTimeout(socketReconnectionTimeout);

    function attemptSocketReconnect() {
        if (socketReconnectionCount < maxReconnectionCount) {
            socketReconnectionCount++;

            if (socketReconnectionCount === 1) {
                nodecg.log.info('Radia websocket has closed.');
            }
            socketReconnectionTimeout = setTimeout(() => {
                nodecg.log.info(`Reconnecting to socket... (Attempt ${socketReconnectionCount})`);
                initSocket(guildId);
            }, connectionTimeouts[socketReconnectionCount - 1]);
        } else {
            nodecg.log.warn('Too many reconnection attempts. Radia websocket is closed.');
        }
    }

    function heartbeat() {
        clearTimeout(socketPingTimeout);

        socketPingTimeout = setTimeout(() => {
            nodecg.log.warn(`Radia socket has not received a heartbeat message in ${pingMessageInterval} milliseconds. Closing connection...`);
            socket.terminate();
        }, pingMessageInterval + 1000);
    }

    if (isEmpty(nodecg.bundleConfig.radia.socketUrl)) {
        nodecg.log.warn('Bundle configuration is missing "radia.socketUrl" property! Predictions may not work as expected.');
        return;
    }

    if (socket) {
        socket.close(expectedSocketClosureCode);
    }

    socket = new WebSocket(`${nodecg.bundleConfig.radia.socketUrl}/events/guild/${guildId}`,
        { headers: { Authorization: nodecg.bundleConfig.radia.authentication } });

    socket.on('open', () => {
        nodecg.log.info('Radia websocket is open.');
        predictionStore.value.status.socketOpen = true;
        clearTimeout(socketReconnectionTimeout);
        socketReconnectionCount = 0;
        heartbeat();
    });

    socket.on('ping', () => {
        heartbeat();
    });

    socket.on('error', err => {
        const messageParts = [];
        if ('code' in err) {
            messageParts.push(`Code: ${(err as Error & { code: string }).code}`);
        }
        if (err.message) {
            messageParts.push(`Message: ${err.message}`);
        }

        nodecg.log.error(`Received error from Radia websocket. ${messageParts.join(', ')}`);
    });

    socket.on('close', (code) => {
        predictionStore.value.status.socketOpen = false;
        clearTimeout(socketPingTimeout);
        if (code !== expectedSocketClosureCode) {
            attemptSocketReconnect();
        }
    });

    socket.on('message', rawMsg => {
        const msg = JSON.parse(rawMsg.toString()) as RadiaSocketMessage;

        if (!msg.subscription) return;

        const validPredictionTypes = [
            'channel.prediction.begin',
            'channel.prediction.progress',
            'channel.prediction.lock',
            'channel.prediction.end'];
        if (!validPredictionTypes.includes(msg.subscription.type)) return;

        if (msg.timestamp) {
            const predictionModificationTime = DateTime.fromISO(predictionStore.value.modificationTime);
            const messageTimestamp = DateTime.fromISO(msg.timestamp);
            if (predictionModificationTime > messageTimestamp) return;
            predictionStore.value.modificationTime = msg.timestamp;
        }

        switch (msg.subscription.type) {
            case 'channel.prediction.begin':
                predictionStore.value.currentPrediction
                    = PredictionDataMapper.fromBeginEvent(msg.event as PredictionBeginEvent);
                break;
            case 'channel.prediction.progress':
                predictionStore.value.currentPrediction
                    = PredictionDataMapper.fromProgressEvent(msg.event as PredictionProgressEvent);
                break;
            case 'channel.prediction.lock':
                predictionStore.value.currentPrediction
                    = PredictionDataMapper.fromLockEvent(msg.event as PredictionLockEvent);
                break;
            case 'channel.prediction.end':
                predictionStore.value.currentPrediction = PredictionDataMapper
                    .applyEndEvent(msg.event as PredictionEndEvent, predictionStore.value.currentPrediction);
        }
    });
}

async function attemptSocketConnection(guildId: string): Promise<void> {
    if (isEmpty(guildId) || isEmpty(nodecg.bundleConfig.radia.socketUrl)) {
        predictionStore.value.status.predictionsEnabled = false;
        predictionStore.value.status.predictionStatusReason = 'Missing Radia configuration. Check your guild ID and socket URL.';
        predictionStore.value.status.socketOpen = false;
        throw new Error('Radia guild ID is not configured!');
    }

    const predictionsSupported = await hasPredictionSupport(guildId);
    predictionStore.value.status.predictionsEnabled = predictionsSupported;
    if (!predictionsSupported) {
        predictionStore.value.status.predictionStatusReason = 'Predictions are not supported by the configured guild.';
        if (socket) {
            socket.close(expectedSocketClosureCode);
        }
        throw new Error('Unable to proceed as some Radia configuration is missing.');
    } else {
        socketReconnectionCount = 0;
        initSocket(guildId);
        const guildPredictions = await getPredictions(guildId);
        assignPredictionData(guildPredictions[0]);
    }
}

radiaSettings.on('change', async (newValue, oldValue) => {
    if (newValue.guildID !== oldValue?.guildID) {
        try {
            await attemptSocketConnection(newValue.guildID);
        } catch (e) {
            nodecg.log.warn(`Unable to get prediction data: ${e?.toString()}`);
        }
    }
});

nodecg.listenFor('reconnectToRadiaSocket', async (data: never, ack: NodeCG.UnhandledAcknowledgement) => {
    try {
        await attemptSocketConnection(radiaSettings.value.guildID);
        ack(null, null);
    } catch (e) {
        nodecg.log.warn(`Unable to reconnect to Radia websocket: ${e.toString()}`);
        return ack(e, null);
    }
});

nodecg.listenFor('getPredictions', async (data: never, ack: NodeCG.UnhandledAcknowledgement) => {
    try {
        const response = await getPredictions(radiaSettings.value.guildID);
        if (response.length > 0) {
            assignPredictionData(response[0]);
            ack(null, response[0]);
        } else {
            ack(null, null);
        }
    } catch (e) {
        ack(e);
    }
});

nodecg.listenFor('postPrediction', async (data: CreatePrediction, ack: NodeCG.UnhandledAcknowledgement) => {
    try {
        const response = await createPrediction(radiaSettings.value.guildID, data);
        assignPredictionData(response);
        ack(null, response);
    } catch (e) {
        ack(e);
    }
});

nodecg.listenFor('patchPrediction', async (data: PatchPrediction, ack: NodeCG.UnhandledAcknowledgement) => {
    try {
        const response = await updatePrediction(radiaSettings.value.guildID, data);
        assignPredictionData(response);
        ack(null, response);
    } catch (e) {
        ack(e);
    }
});

function assignPredictionData(data: PredictionResponse) {
    predictionStore.value.currentPrediction = PredictionDataMapper.fromApiResponse(data);
}
