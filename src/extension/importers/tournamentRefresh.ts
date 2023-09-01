import type NodeCG from '@nodecg/types';
import * as nodecgContext from '../helpers/nodecg';
import { TournamentData } from 'schemas';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import { getBattlefyTournamentData } from './clients/battlefyClient';
import { getSmashGGData } from './clients/smashggClient';
import { updateTournamentDataReplicants } from './tournamentDataHelper';

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
                    return ack(new Error('No smash.gg API key is configured.'));
                }

                updateTournamentDataReplicants(
                    await getSmashGGData(
                        tournamentData.value.meta.sourceSpecificData.smashgg.eventData.id,
                        nodecg.bundleConfig?.smashgg?.apiKey));
                return ack(null);
            }
            default:
                return ack(new Error(`Cannot refresh data from source '${dataSource}'`));
        }
    } catch (e) {
        ack(e);
    }
});

