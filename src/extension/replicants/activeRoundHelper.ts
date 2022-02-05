import { GameWinner } from 'types/enums/gameWinner';
import clone from 'clone';
import { commitActiveRoundToMatchStore } from './roundStore';
import * as nodecgContext from '../helpers/nodecg';
import { ActiveRound, SwapColorsInternally, TournamentData } from 'schemas';
import isEmpty from 'lodash/isEmpty';
import { getTeam } from '../helpers/tournamentDataHelper';
import { MatchStore, RoundStore } from '../../types/schemas';

const nodecg = nodecgContext.get();

const activeRound = nodecg.Replicant<ActiveRound>('activeRound');
const swapColorsInternally = nodecg.Replicant<SwapColorsInternally>('swapColorsInternally');
const matchStore = nodecg.Replicant<MatchStore>('matchStore');
const roundStore = nodecg.Replicant<RoundStore>('roundStore');
const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');

export function setWinner(index: number, winner: GameWinner): void {
    if (index >= activeRound.value.games.length || index < 0) {
        throw new Error(`Cannot set winner for game ${index + 1} as it does not exist.`);
    }

    const newValue = clone(activeRound.value);
    const activeGame = clone(activeRound.value.games[index]);

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

export function setActiveRoundGames(matchId: string): void {
    const match = matchStore.value[matchId];
    if (isEmpty(match)) {
        throw new Error(`Could not find match '${matchId}'.`);
    }
    const relatedRound = roundStore.value[match?.meta.relatedRoundId];
    if (isEmpty(relatedRound)) {
        throw new Error(`Could not find related round '${match.meta.relatedRoundId}'.`);
    }

    const newActiveRound = clone(activeRound.value);

    newActiveRound.round = {
        id: match.meta.relatedRoundId,
        name: relatedRound.meta.name
    };
    newActiveRound.match = {
        id: matchId,
        name: match.meta.name,
        isCompleted: match.meta.isCompleted
    };
    newActiveRound.games = clone(match.games);

    if (match.teamA && match.teamB) {
        newActiveRound.teamA.score = match.teamA.score;
        newActiveRound.teamB.score = match.teamB.score;
    } else {
        newActiveRound.teamA.score = 0;
        newActiveRound.teamB.score = 0;
    }

    activeRound.value = newActiveRound;
}

export function setActiveRoundTeams(teamAId: string, teamBId: string): void {
    const teamA = getTeam(teamAId, tournamentData.value);
    const teamB = getTeam(teamBId, tournamentData.value);
    if ([teamA, teamB].filter(isEmpty).length > 0) {
        throw new Error('Could not find a team.');
    }

    const existingTeamA = clone(activeRound.value.teamA);
    const existingTeamB = clone(activeRound.value.teamB);

    activeRound.value.teamA = {
        score: existingTeamA.score,
        color: existingTeamA.color,
        ...teamA
    };
    activeRound.value.teamB = {
        score: existingTeamB.score,
        color: existingTeamB.color,
        ...teamB
    };
}

