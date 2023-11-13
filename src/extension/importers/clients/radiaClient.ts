import axios, { AxiosError } from 'axios';
import { GuildInfo, GuildServices } from '../../types/radiaApi';
import * as nodecgContext from '../../helpers/nodecg';
import { PredictionResponse } from 'types/prediction';
import { CreatePrediction, PatchPrediction } from 'types/predictionRequests';
import isEmpty from 'lodash/isEmpty';
import { RadiaError, SetGuildInfoResponse } from 'types/radia';

const nodecg = nodecgContext.get();
export async function getGuildInfo(guildId: string): Promise<GuildInfo> {
    try {
        const result = await axios.get<GuildInfo>(
            `${nodecg.bundleConfig.radia.url}/organisation/guild/${guildId}`,
            { headers: { Authorization: nodecg.bundleConfig.radia.authentication } });

        return result.data;
    } catch (e) {
        handleAxiosError(e);
    }
}

export async function hasPredictionSupport(guildId: string): Promise<boolean> {
    if (isEmpty(nodecg.bundleConfig.radia.authentication)) {
        return false;
    }

    try {
        const result = await axios.get<GuildServices>(
            `${nodecg.bundleConfig.radia.url}/predictions/check/${guildId}`,
            { headers: { Authorization: nodecg.bundleConfig.radia.authentication } }
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
export async function getPredictions(guildID: string): Promise<PredictionResponse[]> {
    try {
        const result = await axios.get<PredictionResponse[]>(
            `${nodecg.bundleConfig.radia.url}/predictions/${guildID}`,
            { headers: { Authorization: nodecg.bundleConfig.radia.authentication } });

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
export async function updatePrediction(guildID: string, data: PatchPrediction): Promise<PredictionResponse> {
    try {
        const result = await axios.patch<PredictionResponse>(
            `${nodecg.bundleConfig.radia.url}/predictions/${guildID}`,
            data,
            { headers: { Authorization: nodecg.bundleConfig.radia.authentication } });

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
export async function createPrediction(guildID: string, data: CreatePrediction): Promise<PredictionResponse> {
    try {
        const result = await axios.post<PredictionResponse>(
            `${nodecg.bundleConfig.radia.url}/predictions/${guildID}`,
            data,
            { headers: { Authorization: nodecg.bundleConfig.radia.authentication } });

        return result.data;
    } catch (e) {
        handleAxiosError(e);
    }
}

export function handleAxiosError(e: AxiosError<RadiaError> | Error): void {
    if ('response' in e) {
        let message = `Radia API call failed with response ${e.response.status}`;
        if (e.response.data?.detail) {
            if (typeof e.response.data.detail === 'object') {
                if ('message' in e.response.data.detail && e.response.data.detail.message != null) {
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

export async function updateTournamentData(
    guildId: string,
    bracketLink: string,
    tournamentName: string
): Promise<SetGuildInfoResponse> {
    const response = await axios.post<SetGuildInfoResponse>(
        `${nodecg.bundleConfig.radia.url}/organisation/guild/${guildId}`,
        { bracket_link: bracketLink, tournament_name: tournamentName },
        { headers: { Authorization: nodecg.bundleConfig.radia.authentication } });

    if (response.status !== 200) {
        throw new Error(`Radia API call failed with response ${response.status.toString()}`);
    }
    return response.data;
}
