import axios, { AxiosError } from 'axios';
import { GuildServices } from '../../types/radiaApi';
import * as nodecgContext from '../../helpers/nodecg';
import { Configschema } from 'types/schemas/configschema';
import { Prediction } from 'types/prediction';
import { CreatePrediction, PatchPrediction } from 'types/predictionRequests';

const nodecg = nodecgContext.get();
const radiaConfig = (nodecg.bundleConfig as Configschema).radia;

export async function hasPredictionSupport(guildId: string): Promise<boolean> {
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
export async function getPredictions(guildID: string): Promise<Prediction[]> {
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
 * Patch active Twitch Prediction
 * @param {string} guildID Guild ID of discord server
 * @param data Patch data for prediction
 */
export async function updatePrediction(guildID: string, data: PatchPrediction): Promise<Prediction> {
    try {
        const result = await axios.patch<Prediction>(
            `${radiaConfig.url}/predictions/${guildID}`,
            data,
            { headers: { Authorization: radiaConfig.authentication } });

        return result.data;
    } catch (e) {
        handleAxiosError(e);
    }
}

/**
 * Create a new Twitch Prediction
 * @param {string} guildID Guild ID of discord server
 * @param data Data to create prediction with
 */
export async function createPrediction(guildID: string, data: CreatePrediction): Promise<Prediction> {
    try {
        const result = await axios.post<Prediction>(
            `${radiaConfig.url}/predictions/${guildID}`,
            data,
            { headers: { Authorization: radiaConfig.authentication } });

        return result.data;
    } catch (e) {
        handleAxiosError(e);
    }
}

export function handleAxiosError(e: AxiosError): void {
    if ('response' in e) {
        let message = `Radia API call failed with response ${e.response.status}`;
        if (e.response.data?.detail) {
            if (typeof e.response.data.detail === 'object') {
                if (e.response.data.detail.message) {
                    message += `: ${e.response.data.detail.message}`;
                } else {
                    message += `: ${JSON.stringify(e.response.data.detail)}`;
                }
            } else {
                message += `: ${e.response.data.detail}`;
            }
        }

        throw new Error(message);
    }
    throw e;
}

