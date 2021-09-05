import axios from 'axios';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import * as nodecgContext from '../helpers/nodecg';
import { RoundStore } from 'schemas';
import { handleRoundData } from './roundDataHelper';

const nodecg = nodecgContext.get();

const rounds = nodecg.Replicant<RoundStore>('roundStore');

nodecg.listenFor('getRounds', async (data, ack: UnhandledListenForCb) => {
    if (!data.url) {
        ack(new Error('Missing arguments.'));
        return;
    }

    try {
        const roundData = await getUrl(data.url);
        rounds.value = { ...rounds.value, ...roundData.rounds };
        ack(null, roundData.url);
    } catch (e) {
        ack(e);
    }
});

async function getUrl(url: string): Promise<{rounds: RoundStore, url: string}> {
    return new Promise((resolve, reject) => {
        axios
            .get(url, {
                responseType: 'json'
            })
            .then(response => {
                const rounds = handleRoundData(response.data);

                resolve({
                    rounds,
                    url
                });
            })
            .catch(err => {
                reject(err);
            });
    });
}
