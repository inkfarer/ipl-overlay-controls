import type NodeCG from '@nodecg/types';
import axios from 'axios';
import * as nodecgContext from '../helpers/nodecg';
import { TournamentData } from 'schemas';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import { getBattlefyTournamentData } from './clients/battlefyClient';
import { getSmashGGData, getSmashGGEvents } from './clients/smashggClient';
import { parseUploadedTeamData, updateTournamentDataReplicants } from './tournamentDataHelper';
import { GetSmashggEventRequest, GetTournamentDataRequest } from 'types/messages/tournamentData';
import { SendouInkClientInstance } from '../clients/SendouInkClient';
import i18next from 'i18next';

const nodecg = nodecgContext.get();

if (!nodecg.bundleConfig || typeof nodecg.bundleConfig.smashgg === 'undefined') {
    nodecg.log.warn(i18next.t('tournamentImporter.missingStartggConfigurationWarning', { bundleName: nodecg.bundleName }));
}

nodecg.listenFor('getTournamentData', async (data: GetTournamentDataRequest, ack: NodeCG.UnhandledAcknowledgement) => {
    if (!data.id || !data.method) {
        ack(new Error(i18next.t('invalidArgumentsError')), null);
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
                    ack(new Error(i18next.t('tournamentImporter.missingStartggApiKey')));
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
            case TournamentDataSource.SENDOU_INK: {
                if (SendouInkClientInstance == null) {
                    ack(new Error(i18next.t('tournamentImporter.missingSendouInkApiKey')));
                    break;
                }

                const serviceData = await SendouInkClientInstance.getTournamentData(data.id);
                updateTournamentDataReplicants(serviceData);
                ack(null, { id: serviceData.meta.id });
                break;
            }
            case TournamentDataSource.UPLOAD: {
                const serviceData = await getRawData(data.id);
                updateTournamentDataReplicants(serviceData);
                ack(null, { id: serviceData.meta.id });
                break;
            }
            default:
                return ack(new Error(i18next.t('invalidArgumentsError')));
        }
    } catch (e) {
        ack(e);
    }
});

nodecg.listenFor('getSmashggEvent', async (data: GetSmashggEventRequest, ack: NodeCG.UnhandledAcknowledgement) => {
    try {
        await getSmashggEventData(data.eventId);
        return ack(null, data.eventId);
    } catch (e) {
        return ack(e);
    }
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
        throw new Error(i18next.t('tournamentImporter.rawDataImportFailed', {
            statusCode: response.status,
            url
        }));
    }
}
