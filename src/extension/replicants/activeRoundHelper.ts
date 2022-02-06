import { GameWinner } from 'types/enums/gameWinner';
import { commitActiveRoundToMatchStore } from './matchStore';
import * as nodecgContext from '../helpers/nodecg';
import { ActiveRound, SwapColorsInternally, TournamentData, MatchStore } from 'schemas';
import isEmpty from 'lodash/isEmpty';
import { getTeam } from '../helpers/tournamentDataHelper';
import cloneDeep from 'lodash/cloneDeep';

const nodecg = nodecgContext.get();

const activeRound = nodecg.Replicant<ActiveRound>('activeRound');
const swapColorsInternally = nodecg.Replicant<SwapColorsInternally>('swapColorsInternally');
const matchStore = nodecg.Replicant<MatchStore>('matchStore');
const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');

export function setWinner(index: number, winner: GameWinner): void {
    if (index >= activeRound.value.games.length || index < 0) {
        throw new Error(`Cannot set winner for game ${index + 1} as it does not exist.`);
    }

    const newValue = cloneDeep(activeRound.value);
    const activeGame = cloneDeep(activeRound.value.games[index]);

    if (winner === GameWinner.NO_WINNER) {
        if (activeGame.winner === GameWinner.ALPHA) {
            newValue.teamA.score--;
        } else if (activeGame.winner === GameWinner.BRAVO) {
            newValue.teamB.score--;
        }

        newValue.games[index].winner = GameWinner.NO_WINNER;
        newValue.games[index].color = undefined;
    } else {
        if (winner === GameWinner.ALPHA) {
            newValue.teamA.score++;
            newValue.games[index].winner = winner;

            if (activeGame.winner === GameWinner.BRAVO) {
                newValue.teamB.score--;
            }
        } else if (winner === GameWinner.BRAVO) {
            newValue.teamB.score++;
            newValue.games[index].winner = winner;

            if (activeGame.winner === GameWinner.ALPHA) {
                newValue.teamA.score--;
            }
        }

        if (!activeGame.color) {
            newValue.games[index].color = {
                ...activeRound.value.activeColor,
                clrA: activeRound.value.teamA.color,
                clrB: activeRound.value.teamB.color,
                colorsSwapped: swapColorsInternally.value
            };
        }
    }

    const winThreshold = newValue.games.length / 2;
    newValue.match.isCompleted = (newValue.teamA.score > winThreshold || newValue.teamB.score > winThreshold);

    activeRound.value = newValue;
    commitActiveRoundToMatchStore();
}

export function setActiveRoundGames(activeRound: ActiveRound, matchId: string): void {
    const match = matchStore.value[matchId];
    if (isEmpty(match)) {
        throw new Error(`Could not find match '${matchId}'.`);
    }

    activeRound.match = {
        id: matchId,
        name: match.meta.name,
        isCompleted: match.meta.isCompleted
    };
    activeRound.games = cloneDeep(match.games);

    activeRound.teamA.score = match.teamA.score;
    activeRound.teamB.score = match.teamB.score;
}

export function setActiveRoundTeams(activeRound: ActiveRound, teamAId: string, teamBId: string): void {
    const teamA = getTeam(teamAId, tournamentData.value);
    const teamB = getTeam(teamBId, tournamentData.value);
    if ([teamA, teamB].filter(isEmpty).length > 0) {
        throw new Error('Could not find a team.');
    }

    const existingTeamA = cloneDeep(activeRound.teamA);
    const existingTeamB = cloneDeep(activeRound.teamB);

    activeRound.teamA = {
        score: existingTeamA.score,
        color: existingTeamA.color,
        ...teamA
    };
    activeRound.teamB = {
        score: existingTeamB.score,
        color: existingTeamB.color,
        ...teamB
    };
}

