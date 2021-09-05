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

    try {
        switch (data.method) {
            case TournamentDataSource.BATTLEFY: {
                const serviceData = await getBattlefyTournamentData(data.id);
                updateTeamDataReplicants(serviceData);
                ack(null, serviceData.meta.id);
                break;
            }
            case TournamentDataSource.SMASHGG: {
                if (!smashGGKey) {
                    ack(new Error('No smash.gg token provided.'));
                    break;
                }

                const serviceData = await getSmashGGData(data.id, smashGGKey);
                updateTeamDataReplicants(serviceData);
                ack(null, serviceData.meta.id);
                break;
            }
            case TournamentDataSource.UPLOAD: {
                const serviceData = await getRawData(data.id);
                updateTeamDataReplicants(serviceData);
                ack(null, serviceData.meta.id);
                break;
            }
            default:
                ack(new Error('Invalid method given.'));
        }
    } catch (e) {
        ack(e);
    }
});

async function getRawData(url: string): Promise<TournamentData> {
    const response = await axios.get(url);
    if (response.status === 200) {
        return handleRawData(response.data, url);
    } else {
        throw new Error(`Got response code ${response.status} from URL ${url}`);
    }
}
