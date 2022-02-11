import { RoundStore } from 'schemas';
import { GameWinner } from 'types/enums/gameWinner';
import { generateId } from '../../helpers/generateId';
import { splatModes, splatStages } from '../../helpers/splatoonData';
import { ImporterRound } from 'types/importer';
import { PlayType } from '../../types/enums/playType';

const lowerCaseSplatStages = splatStages.map(stage => stage.toLowerCase());
const lowerCaseSplatModes = splatModes.map(mode => mode.toLowerCase());

export function handleRoundData(rounds: ImporterRound[]): RoundStore {
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
                name: round.name,
                isCompleted: false,
                type: Object.values(PlayType).includes(round.type) ? round.type : PlayType.BEST_OF
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
