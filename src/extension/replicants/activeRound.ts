import * as nodecgContext from '../helpers/nodecg';
import { ActiveRound, NextRound, RoundStore, SwapColorsInternally, TournamentData } from 'schemas';
import { SetActiveRoundRequest, SetWinnerRequest, UpdateActiveGamesRequest } from 'types/messages/activeRound';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import { GameWinner } from 'types/gameWinner';
import clone from 'clone';
import { getTeam } from '../helpers/tournamentDataHelper';
import isEmpty from 'lodash/isEmpty';
import { commitActiveRoundToRoundStore } from './roundStore';

const nodecg = nodecgContext.get();

const activeRound = nodecg.Replicant<ActiveRound>('activeRound');
const nextRound = nodecg.Replicant<NextRound>('nextRound');
const rounds = nodecg.Replicant<RoundStore>('roundStore');
const swapColorsInternally = nodecg.Replicant<SwapColorsInternally>('swapColorsInternally');
const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');

swapColorsInternally.on('change', (newValue, oldValue) => {
    if (oldValue !== undefined) {
        const clrA = activeRound.value.teamA.color;
        activeRound.value.teamA.color = activeRound.value.teamB.color;
        activeRound.value.teamB.color = clrA;
    }
});

nodecg.listenFor('removeWinner', (data: never, ack: UnhandledListenForCb) => {
    try {
        setWinner(activeRound.value.teamA.score + activeRound.value.teamB.score - 1, GameWinner.NO_WINNER);
        ack(null, null);
    } catch (e) {
        ack(e);
    }
});

nodecg.listenFor('setWinner', (data: SetWinnerRequest, ack: UnhandledListenForCb) => {
    const scoreSum = activeRound.value.teamA.score + activeRound.value.teamB.score;
    const index = data.roundIndex != null ? data.roundIndex : scoreSum;

    try {
        setWinner(index, data.winner);
    } catch (e) {
        ack(e);
    }
});

function setWinner(index: number, winner: GameWinner): void {
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

nodecg.listenFor('setActiveRound', (data: SetActiveRoundRequest, ack: UnhandledListenForCb) => {
    try {
        setActiveRound(data.roundId);
    } catch (e) {
        ack(e);
    }
});

nodecg.listenFor('resetActiveRound', () => {
    activeRound.value.teamA.score = 0;
    activeRound.value.teamB.score = 0;
    activeRound.value.games = activeRound.value.games.map(game =>
        ({ ...game, winner: GameWinner.NO_WINNER, color: undefined }));
    commitActiveRoundToRoundStore();
});

nodecg.listenFor('updateActiveGames', (data: UpdateActiveGamesRequest) => {
    activeRound.value.games = clone(data.games);
    commitActiveRoundToRoundStore();
});

nodecg.listenFor('beginNextMatch', (data: never, ack: UnhandledListenForCb) => {
    const teamA = getTeam(nextRound.value.teamA.id, tournamentData.value);
    const teamB = getTeam(nextRound.value.teamB.id, tournamentData.value);

    if ([teamA, teamB].filter(isEmpty).length > 0) {
        ack(new Error('Could not find a team.'));
    }

    activeRound.value = {
        ...activeRound.value,
        teamA: {
            ...activeRound.value.teamA,
            ...teamA,
            score: 0
        },
        teamB: {
            ...activeRound.value.teamB,
            ...teamB,
            score: 0
        },
        games: activeRound.value.games.map(game =>
            ({ ...game, winner: GameWinner.NO_WINNER, color: undefined })),
        round: {
            ...nextRound.value.round
        }
    };

    commitActiveRoundToRoundStore();
});

function setActiveRound(roundId: string): void {
    const selectedRound = rounds.value[roundId];
    const currentActiveRound = clone(activeRound.value);

    if (!selectedRound) {
        throw new Error('No round found.');
    }

    const newValue = activeRound.value;
    newValue.round = {
        id: roundId,
        name: selectedRound.meta.name
    };

    if (selectedRound.teamA && selectedRound.teamB) {
        newValue.teamA = {
            ...currentActiveRound.teamA,
            ...(clone(selectedRound.teamA))
        };
        newValue.teamB = {
            ...currentActiveRound.teamB,
            ...(clone(selectedRound.teamB))
        };
    } else {
        newValue.teamA.score = 0;
        newValue.teamB.score = 0;
    }

    newValue.games = clone(selectedRound.games);

    activeRound.value = newValue;
    commitActiveRoundToRoundStore();
}
