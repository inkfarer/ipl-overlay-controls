import * as nodecgContext from '../util/nodecg';
import { ActiveRound, Rounds, SwapColorsInternally } from 'schemas';
import { UpdateActiveGamesRequest, SetActiveRoundRequest, SetWinnerRequest } from 'types/messages/activeRound';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import { GameWinner } from 'types/gameWinner';
import clone from 'clone';
import { UpdateRoundStoreRequest } from 'types/messages/roundStore';

const nodecg = nodecgContext.get();

const activeRound = nodecg.Replicant<ActiveRound>('activeRound');
const rounds = nodecg.Replicant<Rounds>('rounds');
const swapColorsInternally = nodecg.Replicant<SwapColorsInternally>('swapColorsInternally');

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
        ack(null, null);
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
}

nodecg.listenFor('setActiveRound', (data: SetActiveRoundRequest, ack: UnhandledListenForCb) => {
    const selectedRound = rounds.value[data.roundId];

    if (selectedRound) {
        const newValue = activeRound.value;
        newValue.round = {
            id: data.roundId,
            name: selectedRound.meta.name
        };
        newValue.teamA.score = 0;
        newValue.teamB.score = 0;

        newValue.games = selectedRound.games.map(game => {
            return {
                mode: game.mode,
                stage: game.stage,
                winner: GameWinner.NO_WINNER
            };
        });

        activeRound.value = newValue;
        ack(null, newValue);
    } else {
        return ack(new Error('No round found.'));
    }
});

nodecg.listenFor('updateActiveGames', (data: UpdateActiveGamesRequest) => {
    activeRound.value.games = clone(data.games);
    const roundStoreValue = rounds.value[activeRound.value.round.id];
    if (roundStoreValue) {
        roundStoreValue.games = clone(data.games);
    }
});

nodecg.listenFor('updateRoundStore', (data: UpdateRoundStoreRequest, ack: UnhandledListenForCb) => {
    const roundStoreValue = rounds.value[data.id];
    if (!roundStoreValue) {
        ack(new Error(`No round exists with id ${data.id}`));
    }

    roundStoreValue.games = clone(data.games);
    roundStoreValue.meta.name = data.roundName;

    if (activeRound.value.round.id === data.id) {
        activeRound.value.round.name = data.roundName;
        activeRound.value.games = data.games.map((game, index) =>
            ({ ...activeRound.value.games[index], ...game }));
    }
});
