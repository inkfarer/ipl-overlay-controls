import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import * as nodecgContext from '../helpers/nodecg';
import { HighlightedMatches, TournamentData } from 'schemas';
import { ImportStatus } from 'types/enums/importStatus';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import { getBattlefyMatches } from './clients/battlefyClient';
import { getSmashGGStreamQueue } from './clients/smashggClient';

const nodecg = nodecgContext.get();

const highlightedMatchData = nodecg.Replicant<HighlightedMatches>('highlightedMatches');
const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');

let smashGGKey: string;

if (nodecg.bundleConfig || typeof nodecg.bundleConfig.smashgg !== 'undefined') {
    smashGGKey = nodecg.bundleConfig.smashgg.apiKey;
}

nodecg.listenFor('getHighlightedMatches', async (data, ack: UnhandledListenForCb) => {
    switch (tournamentData.value.meta.source) {
        case TournamentDataSource.BATTLEFY:
            if ((!data.stages && !data.getAllStages)) {
                return ack(new Error('Missing arguments.'));
            }
            getBattlefyMatches(tournamentData.value.meta.id, data.stages, data.getAllStages).then(data => {
                if (data.length > 0) {
                    updateMatchReplicant(data);
                    return ack(null, {
                        status: ImportStatus.SUCCESS,
                        data: data
                    });
                } else {
                    return ack(null, {
                        status: ImportStatus.NO_DATA,
                        data: data
                    });
                }
            }).catch(err => {
                ack(err);
            });
            break;
        case TournamentDataSource.SMASHGG:
            // if smashGGKey is empty, we raise a failure
            if (!smashGGKey) {
                return ack(null, {
                    status: ImportStatus.FAILURE,
                    data: null
                });
            }
            if ((!data.streamIDs)) {
                return ack(new Error('Missing argument.'));
            }
            getSmashGGStreamQueue(tournamentData.value.meta.id, smashGGKey, data.streamIDs).then(data => {
                if (data.length > 0) {
                    updateMatchReplicant(data);
                    return ack(null, {
                        status: ImportStatus.SUCCESS,
                        data: data
                    });
                } else {
                    return ack(null, {
                        status: ImportStatus.NO_DATA,
                        data: data
                    });
                }
            }).catch(err => {
                ack(err);
            });
            break;
        default:
            ack(new Error(`Invalid source '${tournamentData.value.meta.source}' given.`));
    }
});

/**
 * Assigns data to highlightedMatches replicant
 * @param data Data handed back from data provider
 */
function updateMatchReplicant(data: HighlightedMatches): void {
    data.sort((a, b) => {
        const keyA = `${a.meta.stageName} ${a.meta.name}`;
        const keyB = `${b.meta.stageName} ${b.meta.name}`;

        if (keyA < keyB) {
            return -1;
        }
        if (keyA > keyB) {
            return 1;
        }
        return 0;
    });
    // Only assign the data to replicant if there is data
    if (data.length > 0) {
        highlightedMatchData.value = data;
    }
}
