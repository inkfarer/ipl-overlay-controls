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
        name: round.meta.name
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

    activeRound.value.teamA = {
        ...activeRound.value.teamA,
        ...teamA
    };
    activeRound.value.teamB = {
        ...activeRound.value.teamB,
        ...teamB
    };
}

