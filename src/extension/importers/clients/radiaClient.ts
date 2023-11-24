import axios, { AxiosError } from 'axios';
import { GuildInfo, GuildServices } from '../../types/radiaApi';
import * as nodecgContext from '../../helpers/nodecg';
import { PredictionResponse } from 'types/prediction';
import { CreatePrediction, PatchPrediction } from 'types/predictionRequests';
import { RadiaError, SetGuildInfoResponse } from 'types/radia';
import { isBlank } from '../../../helpers/stringHelper';

const nodecg = nodecgContext.get();
export async function getGuildInfo(guildId: string): Promise<GuildInfo> {
    if (isBlank(guildId)) {
        throw new Error('No guild ID provided.');
    }

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
    if (isBlank(nodecg.bundleConfig.radia.authentication) || isBlank(guildId)) {
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
 * @param {string} guildId Guild ID of discord server
 */
export async function getPredictions(guildId: string): Promise<PredictionResponse[]> {
    if (isBlank(guildId)) {
        throw new Error('Cannot retrieve prediction for no guild');
    }

    try {
        const result = await axios.get<PredictionResponse[]>(
            `${nodecg.bundleConfig.radia.url}/predictions/${guildId}`,
            { headers: { Authorization: nodecg.bundleConfig.radia.authentication } });

        return result.data;
    } catch (e) {
        handleAxiosError(e);
    }
}

/**
 * Patch active Twitch Prediction
 * @param {string} guildId Guild ID of discord server
 * @param data Patch data for prediction
 */
export async function updatePrediction(guildId: string, data: PatchPrediction): Promise<PredictionResponse> {
    if (isBlank(guildId)) {
        throw new Error('Cannot update prediction for no guild');
    }

    try {
        const result = await axios.patch<PredictionResponse>(
            `${nodecg.bundleConfig.radia.url}/predictions/${guildId}`,
            data,
            { headers: { Authorization: nodecg.bundleConfig.radia.authentication } });

        return result.data;
    } catch (e) {
        handleAxiosError(e);
    }
}

/**
 * Create a new Twitch Prediction
 * @param {string} guildId Guild ID of discord server
 * @param data Data to create prediction with
 */
export async function createPrediction(guildId: string, data: CreatePrediction): Promise<PredictionResponse> {
    if (isBlank(guildId)) {
        throw new Error('Cannot create prediction for no guild');
    }

    try {
        const result = await axios.post<PredictionResponse>(
            `${nodecg.bundleConfig.radia.url}/predictions/${guildId}`,
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
    if (isBlank(guildId)) {
        throw new Error('No guild ID provided to update tournament data for');
    }

    const response = await axios.post<SetGuildInfoResponse>(
        `${nodecg.bundleConfig.radia.url}/organisation/guild/${guildId}`,
        { bracket_link: bracketLink, tournament_name: tournamentName },
        { headers: { Authorization: nodecg.bundleConfig.radia.authentication } });

    if (response.status !== 200) {
        throw new Error(`Radia API call failed with response ${response.status.toString()}`);
    }
    return response.data;
}
