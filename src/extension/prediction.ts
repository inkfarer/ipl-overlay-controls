import axios from 'axios';
import * as nodecgContext from './util/nodecg';
import { PredictionStore, RadiaSettings } from 'schemas';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import { ErrorDetails, Prediction } from './types/prediction';
import { GuildServices } from './types/radiaApi';
import { CreatePrediction, PatchPrediction } from './types/createPatchPredictions';

const nodecg = nodecgContext.get();

const radiaSettings = nodecg.Replicant<RadiaSettings>('radiaSettings');
const predictionStore = nodecg.Replicant<PredictionStore>('predictionStore');

const radiaConfig = nodecg.bundleConfig.radia;

radiaSettings.on('change', newValue => {
    // Checks if the GuildID provided is enabled for Radia's prediction feature
    axios.get<GuildServices>(`${radiaConfig.url}/predictions/check/${newValue.guildID}`,
        {
            headers: {
                Authorization: radiaConfig.authentication
            }
        }).then(response => {
        if (response.status !== 200) {
            predictionStore.value.enablePrediction = false;
            nodecg.log.error(`Guild Check Auth Error: ${response.data.detail}`);
            return;
        }
        if (typeof response.data.twitch === 'boolean') {
            predictionStore.value.enablePrediction = response.data.twitch;
            if(response.data.twitch){
                // If the Twitch field is true we load the predictionStore with the latest Twitch Prediction Data
                getGuildPredictions(radiaConfig.url, radiaConfig.authentication, newValue.guildID).then(
                    response => {
                        assignPredictionData(response[0]);
                    }).catch(err => {
                    nodecg.log.error(`Twitch Prediction Load Error: ${err}`);
                });
            }
            return;
        } else {
            predictionStore.value.enablePrediction = false;
            return;
        }
    }).catch(err => {
        predictionStore.value.enablePrediction = false;
        nodecg.log.error(`Guild Check Auth Error: ${err}`);
    });
});

nodecg.listenFor('getPredictions', async (data, ack: UnhandledListenForCb) => {
    getGuildPredictions(radiaConfig.url, radiaConfig.authentication, radiaSettings.value.guildID)
        .then(data => {
            if(data.length > 0){
                assignPredictionData(data[0]);
                ack(null,data);
            }
        }).catch(err => {
            ack(err.data as ErrorDetails);
        });
});

nodecg.listenFor('postPrediction', async  (data: CreatePrediction, ack: UnhandledListenForCb) => {
    postGuildPrediction(radiaConfig.url, radiaConfig.authentication, radiaSettings.value.guildID, data)
        .then(response => {
            assignPredictionData(response);
            ack(null, response);
        }).catch(err => {
            ack(err.data as ErrorDetails);
        });
});

nodecg.listenFor('patchPrediction', async  (data: PatchPrediction, ack: UnhandledListenForCb) => {
    patchGuildPrediction(radiaConfig.url, radiaConfig.authentication, radiaSettings.value.guildID, data)
        .then(response => {
            assignPredictionData(response);
            ack(null,response);
        }).catch(err => {
            ack(err.data as ErrorDetails);
        });
});

/**
 * Assigns data to prediction replicant
 * @param data Prediction Data
 */
function assignPredictionData(data: Prediction){
    // If outcome's top_predictors is null, change to empty array
    if(data.outcomes[0].top_predictors === null){
        data.outcomes[0].top_predictors = [];
    }
    if(data.outcomes[1].top_predictors === null){
        data.outcomes[1].top_predictors = [];
    }
    predictionStore.value.currentPrediction = data;
}

/**
 * Get predictions on from Discord Guild
 * @param {string} url Base API URL
 * @param {string} authorisation API key for authentication
 * @param {string} guildID Guild ID of discord server
 */
async function getGuildPredictions(url: string, authorisation: string, guildID: string): Promise<Prediction[]> {
    return new Promise((resolve, reject) => {
        axios.get<Prediction[]>(`${url}/predictions/${guildID}`, {
            headers: {
                Authorization: authorisation
            }
        }).then(response => {
            if (response.status !== 200) {
                reject(`Radia API call failed with response ${response.status.toString()}`);
                return;
            }
            resolve(response.data);
        }
        ).catch(err => {
            reject(err);
        });
    });
}

/**
 * Create a new Twitch Prediction
 * @param {string} url Base API URL
 * @param {string} authorisation API key for authentication
 * @param {string} guildID Guild ID of discord server
 * @param postData Data to create prediction with
 */
async function postGuildPrediction(url: string, authorisation: string,
    guildID: string, postData: CreatePrediction): Promise<Prediction> {
    return new Promise((resolve, reject) => {
        axios.post<Prediction>(`${url}/predictions/${guildID}`, postData, {
            headers: {
                Authorization: authorisation
            }
        }
        ).then(response => {
            if (response.status !== 200) {
                reject(`Radia API call failed with response ${response.status.toString()}`);
                return;
            }
            resolve(response.data);
        }
        ).catch(err => {
            reject(err);
        });
    });
}

/**
 * Patch active Twitch Prediction
 * @param {string} url Base API URL
 * @param {string} authorisation API key for authentication
 * @param {string} guildID Guild ID of discord server
 * @param patchData Patch data for prediction
 */
async function patchGuildPrediction(url: string, authorisation: string,
    guildID: string, patchData: PatchPrediction): Promise<Prediction> {
    return new Promise((resolve, reject) => {
        axios.patch<Prediction>(`${url}/predictions/${guildID}`, patchData, {
            headers: {
                Authorization: authorisation
            }
        }
        ).then(response => {
            if (response.status !== 200) {
                reject(`Radia API call failed with response ${response.status.toString()}`);
                return;
            }
            resolve(response.data);
        }
        ).catch(err => {
            reject(err);
        });
    });
}
