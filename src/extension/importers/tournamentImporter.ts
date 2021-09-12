import axios from 'axios';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import * as nodecgContext from '../helpers/nodecg';
import { RadiaSettings, TournamentData } from 'schemas';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import { getBattlefyTournamentData } from './clients/battlefyClient';
import { getSmashGGData, getSmashGGEvents } from './clients/smashggClient';
import { handleRawData, updateTeamDataReplicants } from './tournamentDataHelper';
import { GetSmashggEventRequest } from 'types/messages/tournamentData';
import { updateTournamentData } from './clients/radiaClient';
import isEmpty from 'lodash/isEmpty';

const nodecg = nodecgContext.get();
const radiaSettings = nodecg.Replicant<RadiaSettings>('radiaSettings');

let smashGGKey: string;

if (!nodecg.bundleConfig || typeof nodecg.bundleConfig.smashgg === 'undefined') {
    nodecg.log.warn(
        `"smashgg" is not defined in cfg/${nodecg.bundleName}.json! `
        + 'Importing tournament data from smash.gg will not be possible.'
    );
} else {
    smashGGKey = nodecg.bundleConfig.smashgg.apiKey;
}

nodecg.listenFor('getTournamentData', async (data, ack: UnhandledListenForCb) => {
    if (!data.id || !data.method) {
        ack(new Error('Missing arguments.'), null);
        return;
    }

    try {
        switch (data.method) {
            case TournamentDataSource.BATTLEFY: {
                const serviceData = await getBattlefyTournamentData(data.id);
                updateTeamDataReplicants(serviceData);
                await updateRadiaTournamentData(serviceData.meta.url, serviceData.meta.name);
                ack(null, { id: serviceData.meta.id });
                break;
            }
            case TournamentDataSource.SMASHGG: {
                if (!smashGGKey) {
                    ack(new Error('No smash.gg token provided.'));
                    break;
                }

                const events = await getSmashGGEvents(data.id, smashGGKey);

                if (events.length === 1) {
                    await getSmashggEventData(events[0].id);
                    return ack(null, { id: data.id });
                } else {
                    return ack(null, { id: data.id, events });
                }
            }
            case TournamentDataSource.UPLOAD: {
                const serviceData = await getRawData(data.id);
                updateTeamDataReplicants(serviceData);
                ack(null, { id: serviceData.meta.id });
                break;
            }
            default:
                return ack(new Error('Invalid method given.'));
        }

    } catch (e) {
        ack(e);
    }
});

nodecg.listenFor('getSmashggEvent', async (data: GetSmashggEventRequest, ack: UnhandledListenForCb) => {
    await getSmashggEventData(data.eventId);
    ack(null, data.eventId);
});

async function getSmashggEventData(eventId: number): Promise<void> {
    const serviceData = await getSmashGGData(eventId, smashGGKey);
    updateTeamDataReplicants(serviceData);
    await updateRadiaTournamentData(serviceData.meta.url, serviceData.meta.name);
}

async function getRawData(url: string): Promise<TournamentData> {
    const response = await axios.get(url);
    if (response.status === 200) {
        return handleRawData(response.data, url);
    } else {
        throw new Error(`Got response code ${response.status} from URL ${url}`);
    }
}

async function updateRadiaTournamentData(tournamentUrl: string, tournamentName: string): Promise<void> {
    if (radiaSettings.value.updateOnImport && !isEmpty(radiaSettings.value.guildID)) {
        try {
            await updateTournamentData(radiaSettings.value.guildID, tournamentUrl, tournamentName);
        } catch (e) {
            nodecg.log.warn(`Radia tournament data update failed: ${e}`);
        }
    }
}
