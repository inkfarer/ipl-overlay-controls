import type NodeCG from '@nodecg/types';
import * as nodecgContext from '../helpers/nodecg';
import { TournamentData } from 'schemas';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import { getBattlefyTournamentData } from './clients/battlefyClient';
import { getSmashGGData } from './clients/smashggClient';
import { updateTournamentDataReplicants } from './tournamentDataHelper';
import { SendouInkClientInstance } from '../clients/SendouInkClient';
import i18next from 'i18next';

const nodecg = nodecgContext.get();

const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');

nodecg.listenFor('refreshTournamentData', async (data: never, ack: NodeCG.UnhandledAcknowledgement) => {
    try {
        const dataSource = tournamentData.value.meta.source;
        switch (dataSource) {
            case TournamentDataSource.BATTLEFY: {
                updateTournamentDataReplicants(await getBattlefyTournamentData(tournamentData.value.meta.id));
                return ack(null);
            }
            case TournamentDataSource.SMASHGG: {
                if (!nodecg.bundleConfig?.smashgg?.apiKey) {
                    return ack(new Error(i18next.t('tournamentImporter.missingStartggApiKey')));
                }

                updateTournamentDataReplicants(
                    await getSmashGGData(
                        tournamentData.value.meta.sourceSpecificData.smashgg.eventData.id,
                        nodecg.bundleConfig?.smashgg?.apiKey));
                return ack(null);
            }
            case TournamentDataSource.SENDOU_INK: {
                if (SendouInkClientInstance == null) {
                    return ack(new Error(i18next.t('tournamentImporter.missingSendouInkApiKey')));
                }

                updateTournamentDataReplicants(
                    await SendouInkClientInstance.getTournamentData(tournamentData.value.meta.id));
                return ack(null);
            }
            default:
                return ack(new Error(i18next.t('tournamentRefresh.unsupportedSource', { source: dataSource })));
        }
    } catch (e) {
        ack(e);
    }
});

