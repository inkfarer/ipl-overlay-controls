import * as nodecgContext from '../helpers/nodecg';
import { Configschema, PredictionStore, RadiaSettings } from 'schemas';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import {
    PredictionBeginEvent, PredictionEndEvent, PredictionLockEvent, PredictionProgressEvent, PredictionResponse
} from 'types/prediction';
import { CreatePrediction, PatchPrediction } from 'types/predictionRequests';
import { createPrediction, getPredictions, hasPredictionSupport, updatePrediction } from './clients/radiaClient';
import WebSocket from 'ws';
import { PredictionDataMapper } from './mappers/predictionDataMapper';
import { RadiaSocketMessage } from '../types/radiaApi';
import { DateTime } from 'luxon';
import isEmpty from 'lodash/isEmpty';

const nodecg = nodecgContext.get();

const radiaConfig = (nodecg.bundleConfig as Configschema).radia;
const radiaSettings = nodecg.Replicant<RadiaSettings>('radiaSettings');
const predictionStore = nodecg.Replicant<PredictionStore>('predictionStore');

let socket: WebSocket;

function initSocket(guildId: string): void {
    if (isEmpty(radiaConfig.socketUrl)) {
        nodecg.log.warn('Bundle configuration is missing "radia.socketUrl" property! Predictions may not work as expected.');
        return;
    }

    if (socket && socket.readyState !== WebSocket.CLOSED) {
        socket.close();
    }

    socket = new WebSocket(`${radiaConfig.socketUrl}/events/guild/${guildId}`,
        { headers: { Authorization: radiaConfig.authentication } });

    socket.on('open', () => {
        predictionStore.value.status.socketOpen = true;
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

    socket.on('close', () => {
        predictionStore.value.status.socketOpen = false;
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

radiaSettings.on('change', async (newValue) => {
    if (isEmpty(newValue.guildID)) {
        nodecg.log.warn('Radia guild ID is not configured!');
        return;
    }

    const predictionsSupported = await hasPredictionSupport(newValue.guildID);
    predictionStore.value.status.predictionsEnabled = predictionsSupported;

    // If predictions are supported, fetch them
    if (predictionsSupported) {
        initSocket(newValue.guildID);
        try {
            const guildPredictions = await getPredictions(newValue.guildID);
            assignPredictionData(guildPredictions[0]);
        } catch (e) {
            nodecg.log.error(e.toString());
        }
    }
});

nodecg.listenFor('getPredictions', async (data: never, ack: UnhandledListenForCb) => {
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

nodecg.listenFor('postPrediction', async (data: CreatePrediction, ack: UnhandledListenForCb) => {
    try {
        const response = await createPrediction(radiaSettings.value.guildID, data);
        assignPredictionData(response);
        ack(null, response);
    } catch (e) {
        ack(e);
    }
});

nodecg.listenFor('patchPrediction', async (data: PatchPrediction, ack: UnhandledListenForCb) => {
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
