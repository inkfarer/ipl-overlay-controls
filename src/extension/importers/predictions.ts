import * as nodecgContext from '../helpers/nodecg';
import { PredictionStore, RadiaSettings } from 'schemas';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import { PredictionResponse } from 'types/prediction';
import { CreatePrediction, PatchPrediction } from 'types/predictionRequests';
import { PredictionStatus } from 'types/enums/predictionStatus';
import {
    hasPredictionSupport,
    getPredictions,
    updatePrediction,
    createPrediction
} from './clients/radiaClient';
import { PredictionDataMapper } from './mappers/predictionDataMapper';

const nodecg = nodecgContext.get();

const radiaSettings = nodecg.Replicant<RadiaSettings>('radiaSettings');
const predictionStore = nodecg.Replicant<PredictionStore>('predictionStore');

let predictionFetchErrorCount = 0;
let predictionFetchInterval: NodeJS.Timeout;

radiaSettings.on('change', async (newValue) => {
    const predictionsSupported = await hasPredictionSupport(newValue.guildID);
    predictionStore.value.enablePrediction = predictionsSupported;

    // If predictions are supported, fetch them
    if (predictionsSupported) {
        try {
            const guildPredictions = await getPredictions(newValue.guildID);
            assignPredictionData(guildPredictions[0]);
        } catch (e) {
            nodecg.log.error(e.toString());
        }
    }
});

predictionStore.on('change', newValue => {
    if (newValue.currentPrediction?.status === PredictionStatus.ACTIVE && predictionFetchInterval == null) {
        predictionFetchInterval = setInterval(async () => {
            try {
                const guildPredictions = await getPredictions(radiaSettings.value.guildID);
                assignPredictionData(guildPredictions[0]);
                predictionFetchErrorCount = 0;
            } catch (e) {
                nodecg.log.error(e.toString());

                // stop fetching if we get too many errors
                predictionFetchErrorCount++;
                if (predictionFetchErrorCount >= 3) {
                    clearInterval(predictionFetchInterval);
                    predictionFetchInterval = undefined;
                    nodecg.log.warn('Got too many errors fetching prediction data.');
                }
            }
        }, 25000);
    } else if (newValue.currentPrediction?.status !== PredictionStatus.ACTIVE && predictionFetchInterval != null) {
        predictionFetchErrorCount = 0;
        clearInterval(predictionFetchInterval);
        predictionFetchInterval = undefined;
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
