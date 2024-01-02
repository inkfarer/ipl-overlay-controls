import type NodeCG from '@nodecg/types';
import axios from 'axios';
import * as nodecgContext from '../helpers/nodecg';
import { RoundStore } from 'schemas';
import { handleRoundData } from './roundDataHelper';
import { setNextRoundGames } from '../helpers/nextRoundHelper';
import { RuntimeConfig } from 'schemas';
import { GameVersion } from 'types/enums/gameVersion';
import { importFromMapsIplabs } from './roundFromMapsIplabs';

const nodecg = nodecgContext.get();
const rounds = nodecg.Replicant<RoundStore>('roundStore');
const runtimeConfig = nodecg.Replicant<RuntimeConfig>('runtimeConfig');

nodecg.listenFor('getRounds', async (data, ack: NodeCG.UnhandledAcknowledgement) => {
    if (!data.url) {
        ack(new Error('Missing arguments.'));
        return;
    }

    if (data.url.includes('maps.iplabs.ink')) {
        if (runtimeConfig.value.gameVersion !== GameVersion.SPLATOON_3) {
            ack(new Error('maps.iplabs.ink links only support Splatoon 3'));
            return;
        }

        try {
            const roundData = importFromMapsIplabs(data.url);
            updateRounds(roundData);
            ack(null, roundData.url);
        } catch (e) {
            ack(e);
        }
        return;
    }

    try {
        const roundData = await getUrl(data.url);
        updateRounds(roundData.rounds);
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
                const rounds = handleRoundData(response.data, runtimeConfig.value.gameVersion as GameVersion);

                resolve({ rounds, url });
            })
            .catch(err => {
                reject(err);
            });
    });
}

export function updateRounds(newValue: RoundStore): void {
    rounds.value = newValue;
    setNextRoundGames(Object.keys(newValue)[0]);
}
