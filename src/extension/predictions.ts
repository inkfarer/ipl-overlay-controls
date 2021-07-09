import axios, { AxiosError } from 'axios';
import * as nodecgContext from './util/nodecg';
import { PredictionStore, RadiaSettings } from 'schemas';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import { Prediction } from 'types/prediction';
import { GuildServices } from './types/radiaApi';
import { CreatePrediction, PatchPrediction } from 'types/predictionRequests';
import { PredictionStatus } from 'types/predictionStatus';
import { Configschema } from '../../schemas/configschema';

const nodecg = nodecgContext.get();

const radiaSettings = nodecg.Replicant<RadiaSettings>('radiaSettings');
const predictionStore = nodecg.Replicant<PredictionStore>('predictionStore');
const radiaConfig = (nodecg.bundleConfig as Configschema).radia;

let predictionFetchErrorCount = 0;
let predictionFetchInterval: NodeJS.Timeout;

radiaSettings.on('change', async (newValue) => {
    const predictionsSupported = await checkGuildPredictionSupport(newValue.guildID);
    predictionStore.value.enablePrediction = predictionsSupported;

    // If predictions are supported, fetch them
    if (predictionsSupported) {
        try {
            const guildPredictions = await getGuildPredictions(newValue.guildID);
            assignPredictionData(guildPredictions[0]);
        } catch (e) {
            nodecg.log.error(e.toString());
        }
    }
});

predictionStore.on('change', newValue => {
    if (newValue.currentPrediction?.status === PredictionStatus.ACTIVE) {
        predictionFetchInterval = setInterval(async () => {
            try {
                const guildPredictions = await getGuildPredictions(radiaSettings.value.guildID);
                assignPredictionData(guildPredictions[0]);
                predictionFetchErrorCount = 0;
            } catch (e) {
                nodecg.log.error(e.toString());

                // stop fetching if we get too many errors
                predictionFetchErrorCount++;
                if (predictionFetchErrorCount >= 3) {
                    clearInterval(predictionFetchInterval);
                    nodecg.log.info('Got too many errors fetching prediction data.');
                }
            }
        }, 25000);
    } else {
        clearInterval(predictionFetchInterval);
    }
});

nodecg.listenFor('getPredictions', async (data: never, ack: UnhandledListenForCb) => {
    try {
        const response = await getGuildPredictions(radiaSettings.value.guildID);
        if (response.length > 0) {
            assignPredictionData(response[0]);
            ack(null, response[0]);
        }
    } catch (e) {
        ack(e);
    }
});

nodecg.listenFor('postPrediction', async (data: CreatePrediction, ack: UnhandledListenForCb) => {
    try {
        const response = await postGuildPrediction(radiaSettings.value.guildID, data);
        assignPredictionData(response);
        ack(null, response);
    } catch (e) {
        ack(e);
    }
});

nodecg.listenFor('patchPrediction', async (data: PatchPrediction, ack: UnhandledListenForCb) => {
    try {
        const response = await patchGuildPrediction(radiaSettings.value.guildID, data);
        assignPredictionData(response);
        ack(null, response);
    } catch (e) {
        ack(e);
    }
});

/**
 * Assigns data to prediction replicant
 * @param data Prediction Data
 */
function assignPredictionData(data: Prediction) {
    // If outcome's top_predictors is null, change to empty array
    data.outcomes.forEach(outcome => {
        if (outcome.top_predictors === null) {
            outcome.top_predictors = [];
        }
    });

    predictionStore.value.currentPrediction = data;
}

async function checkGuildPredictionSupport(guildId: string): Promise<boolean> {
    try {
        const result = await axios.get<GuildServices>(
            `${radiaConfig.url}/predictions/check/${guildId}`,
            { headers: { Authorization: radiaConfig.authentication } }
        );

        if (result.status === 200) {
            return typeof result.data.twitch === 'boolean' ? result.data.twitch : false;
        } else {
            nodecg.log.error(`Guild Check Auth Error: ${result.data.detail}`);
            return false;
        }
    } catch (e) {
        nodecg.log.error(`Guild Check Auth Error: ${e}`);
        return false;
    }
}

/**
 * Get predictions on from Discord Guild
 * @param {string} guildID Guild ID of discord server
 */
async function getGuildPredictions(guildID: string): Promise<Prediction[]> {
    try {
        const result = await axios.get<Prediction[]>(
            `${radiaConfig.url}/predictions/${guildID}`,
            { headers: { Authorization: radiaConfig.authentication } });

        return result.data;
    } catch (e) {
        handleAxiosError(e);
    }
}

/**
 * Create a new Twitch Prediction
 * @param {string} guildID Guild ID of discord server
 * @param postData Data to create prediction with
 */
async function postGuildPrediction(guildID: string, postData: CreatePrediction): Promise<Prediction> {
    try {
        const result = await axios.post<Prediction>(
            `${radiaConfig.url}/predictions/${guildID}`,
            postData,
            { headers: { Authorization: radiaConfig.authentication } });

        return result.data;
    } catch (e) {
        handleAxiosError(e);
    }
}

/**
 * Patch active Twitch Prediction
 * @param {string} guildID Guild ID of discord server
 * @param patchData Patch data for prediction
 */
async function patchGuildPrediction(guildID: string, patchData: PatchPrediction): Promise<Prediction> {
    try {
        const result = await axios.patch<Prediction>(
            `${radiaConfig.url}/predictions/${guildID}`,
            patchData,
            { headers: { Authorization: radiaConfig.authentication } });

        return result.data;
    } catch (e) {
        handleAxiosError(e);
    }
}

function handleAxiosError(e: AxiosError) {
    if ('response' in e) {
        let message = `Radia API call failed with response ${e.response.status}`;
        if (e.response.data?.detail) {
            message += `: ${e.response.data.detail}`;
        }

        throw new Error(message);
    }
    throw e;
}
