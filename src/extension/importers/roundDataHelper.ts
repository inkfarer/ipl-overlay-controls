import { RoundStore } from 'schemas';
import { GameWinner } from 'types/enums/gameWinner';
import { generateId } from '../../helpers/generateId';
import { splatModes, splatStages } from '../../helpers/splatoonData';
import { ImporterRound } from 'types/importer';
import { TournamentData } from '../../types/schemas';
import * as nodecgContext from '../helpers/nodecg';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';

const nodecg = nodecgContext.get();

const roundStore = nodecg.Replicant<RoundStore>('roundStore');

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
                isCompleted: false
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

export function clearProgressForUnknownTeams(tournamentData: TournamentData): void {
    const teamIds = tournamentData.teams.map(team => team.id);

    const newRounds = cloneDeep(roundStore.value);
    Object.values(newRounds).forEach(round => {
        if (!isEmpty(round.teamA) || !isEmpty(round.teamB)) {
            if (!teamIds.includes(round.teamA.id) || !teamIds.includes(round.teamB.id)) {
                delete round.meta.completionTime;
                round.meta.isCompleted = false;
                delete round.teamA;
                delete round.teamB;
            }
        }
    });

    roundStore.value = newRounds;
}
