import axios from 'axios';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import * as nodecgContext from '../helpers/nodecg';
import { TournamentData } from 'schemas';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import { getBattlefyTournamentData } from './clients/battlefyClient';
import { getSmashGGData, getSmashGGEvents } from './clients/smashggClient';
import { parseUploadedTeamData, updateTournamentDataReplicants } from './tournamentDataHelper';
import { GetSmashggEventRequest } from 'types/messages/tournamentData';
import { GetTournamentDataRequest } from '../../types/messages/tournamentData';

const nodecg = nodecgContext.get();

if (!nodecg.bundleConfig || typeof nodecg.bundleConfig.smashgg === 'undefined') {
    nodecg.log.warn(
        `"smashgg" is not defined in cfg/${nodecg.bundleName}.json! `
        + 'Importing tournament data from smash.gg will not be possible.'
    );
}

nodecg.listenFor('getTournamentData', async (data: GetTournamentDataRequest, ack: UnhandledListenForCb) => {
    if (!data.id || !data.method) {
        ack(new Error('Missing arguments.'), null);
        return;
    }

    try {
        switch (data.method) {
            case TournamentDataSource.BATTLEFY: {
                const serviceData = await getBattlefyTournamentData(data.id);
                updateTournamentDataReplicants(serviceData);
                ack(null, { id: serviceData.meta.id });
                break;
            }
            case TournamentDataSource.SMASHGG: {
                if (!nodecg.bundleConfig?.smashgg?.apiKey) {
                    ack(new Error('No smash.gg token provided.'));
                    break;
                }

                const events = await getSmashGGEvents(data.id, nodecg.bundleConfig?.smashgg?.apiKey);

                if (events.length === 1) {
                    await getSmashggEventData(events[0].id);
                    return ack(null, { id: data.id });
                } else {
                    return ack(null, { id: data.id, events });
                }
            }
            case TournamentDataSource.UPLOAD: {
                const serviceData = await getRawData(data.id);
                updateTournamentDataReplicants(serviceData);
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
    const serviceData = await getSmashGGData(eventId, nodecg.bundleConfig?.smashgg?.apiKey);
    updateTournamentDataReplicants(serviceData);
}

async function getRawData(url: string): Promise<TournamentData> {
    const response = await axios.get(url);
    if (response.status === 200) {
        return parseUploadedTeamData(response.data, url);
    } else {
        throw new Error(`Got response code ${response.status} from URL ${url}`);
    }
}
