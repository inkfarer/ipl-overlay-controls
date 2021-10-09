import { GameWinner } from 'types/enums/gameWinner';
import clone from 'clone';
import { commitActiveRoundToRoundStore } from './roundStore';
import * as nodecgContext from '../helpers/nodecg';
import { ActiveRound, RoundStore, SwapColorsInternally, TournamentData } from 'schemas';
import isEmpty from 'lodash/isEmpty';
import { getTeam } from '../helpers/tournamentDataHelper';

const nodecg = nodecgContext.get();

const activeRound = nodecg.Replicant<ActiveRound>('activeRound');
const swapColorsInternally = nodecg.Replicant<SwapColorsInternally>('swapColorsInternally');
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
    newValue.round.isCompleted = (newValue.teamA.score > winThreshold || newValue.teamB.score > winThreshold);

    activeRound.value = newValue;
    commitActiveRoundToRoundStore();
}

export function setActiveRoundGames(roundId: string): void {
    const round = roundStore.value[roundId];
    if (isEmpty(round)) {
        throw new Error(`Could not find round '${roundId}'.`);
    }

    activeRound.value.round = {
        id: roundId,
        name: round.meta.name,
        isCompleted: round.meta.isCompleted
    };
    activeRound.value.games = clone(round.games);

    if (round.teamA && round.teamB) {
        activeRound.value.teamA.score = round.teamA.score;
        activeRound.value.teamB.score = round.teamB.score;
    } else {
        activeRound.value.teamA.score = 0;
        activeRound.value.teamB.score = 0;
    }
}

export function setActiveRoundTeams(teamAId: string, teamBId: string): void {
    const teamA = getTeam(teamAId, tournamentData.value);
    const teamB = getTeam(teamBId, tournamentData.value);
    if ([teamA, teamB].filter(isEmpty).length > 0) {
        throw new Error('Could not find a team.');
    }

    const existingTeamA = clone(activeRound.value.teamA);
    delete existingTeamA.logoUrl;
    const existingTeamB = clone(activeRound.value.teamB);
    delete existingTeamB.logoUrl;

    activeRound.value.teamA = {
        ...existingTeamA,
        ...teamA
    };
    activeRound.value.teamB = {
        ...existingTeamB,
        ...teamB
    };
}

