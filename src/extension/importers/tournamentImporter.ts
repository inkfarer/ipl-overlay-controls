import axios from 'axios';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import * as nodecgContext from '../helpers/nodecg';
import { TournamentData } from 'schemas';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import { getBattlefyTournamentData } from './clients/battlefyClient';
import { getSmashGGData } from './clients/smashggClient';
import { handleRawData, updateTeamDataReplicants } from './tournamentDataHelper';

const nodecg = nodecgContext.get();

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

    switch (data.method) {
        case TournamentDataSource.BATTLEFY:
            getBattlefyTournamentData(data.id)
                .then(data => {
                    updateTeamDataReplicants(data);
                    ack(null, data.meta.id);
                })
                .catch(err => {
                    ack(err);
                });
            break;
        case TournamentDataSource.SMASHGG:
            if (!smashGGKey) {
                ack(new Error('No smash.gg token provided.'));
                break;
            }

            getSmashGGData(data.id, smashGGKey)
                .then(data => {
                    updateTeamDataReplicants(data);
                    ack(null, data.meta.id);
                })
                .catch(err => {
                    ack(err);
                });
            break;
        case TournamentDataSource.UPLOAD:
            getRawData(data.id)
                .then(data => {
                    updateTeamDataReplicants(data);
                    ack(null, data.meta.id);
                })
                .catch(err => {
                    ack(err);
                });
            break;
        default:
            ack(new Error('Invalid method given.'));
    }
});

async function getRawData(url: string): Promise<TournamentData> {
    return new Promise((resolve, reject) => {
        axios
            .get(url)
            .then(response => {
                const finalResponse = handleRawData(response.data, url);
                resolve(finalResponse);
            })
            .catch(err => {
                reject(err);
            });
    });
}
