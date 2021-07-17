import axios from 'axios';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import * as nodecgContext from '../util/nodecg';
import { Round, RoundStore } from 'schemas';
import { splatModes, splatStages } from '../../helpers/splatoonData';
import { generateId } from '../../helpers/generateId';
import { GameWinner } from 'types/gameWinner';

const nodecg = nodecgContext.get();

const rounds = nodecg.Replicant<RoundStore>('roundStore');

nodecg.listenFor('getRounds', async (data, ack: UnhandledListenForCb) => {
    if (!data.url) {
        ack(new Error('Missing arguments.'), null);
        return;
    }

    getUrl(data.url)
        .then(data => {
            rounds.value = { ...rounds.value, ...data.rounds };
            ack(null, data.url);
        })
        .catch(err => {
            ack(err);
        });
});

const lowerCaseSplatStages = splatStages.map(stage => stage.toLowerCase());

const lowerCaseSplatModes = splatModes.map(mode => mode.toLowerCase());

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

export function handleRoundData(rounds: Round[]): RoundStore {
    const result: RoundStore = {};

    for (let i = 0; i < rounds.length; i++) {
        const round = rounds[i];
        const games = [];
        const roundGames = round.games == null ? round.maps : round.games;

        if (!roundGames) continue;

        for (let j = 0; j < roundGames.length; j++) {
            const game = roundGames[j];
            const stageName = game.stage == null ? game.map : game.stage;

            games.push({
                stage: normalizeStageName(stageName),
                mode: normalizeModeName(game.mode),
                winner: GameWinner.NO_WINNER
            });
        }

        result[generateId()] = {
            meta: {
                name: round.name
            },
            games
        };
    }

    return result;
}

function normalizeStageName(name: string): string {
    name = name.toLowerCase();

    if (!lowerCaseSplatStages.includes(name)) {
        return 'Unknown Stage';
    }

    return splatStages[lowerCaseSplatStages.indexOf(name)];
}

function normalizeModeName(name: string): string {
    name = name.toLowerCase();

    if (!lowerCaseSplatModes.includes(name)) {
        return 'Unknown Mode';
    }

    return splatModes[lowerCaseSplatModes.indexOf(name)];
}
