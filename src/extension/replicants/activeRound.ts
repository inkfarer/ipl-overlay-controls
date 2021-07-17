import * as nodecgContext from '../util/nodecg';
import { ActiveRound, Rounds, SwapColorsInternally } from 'schemas';
import { SetActiveRoundRequest, SetWinnerRequest, UpdateActiveGamesRequest } from 'types/messages/activeRound';
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
    const currentActiveRound = clone(activeRound.value);

    if (!selectedRound) {
        return ack(new Error('No round found.'));
    }

    // A team has to win this many games to be considered the winner of the set
    const winThreshold = currentActiveRound.games.length / 2;
    const isCompleted
        = (currentActiveRound.teamA.score > winThreshold || currentActiveRound.teamB.score > winThreshold);
    const isStarted = currentActiveRound.teamA.score + currentActiveRound.teamB.score > 0;

    rounds.value[currentActiveRound.round.id] = {
        ...(rounds.value[currentActiveRound.round.id]),
        meta: {
            name: currentActiveRound.round.name,
            isCompleted
        },
        teamA: isStarted ? currentActiveRound.teamA : undefined,
        teamB: isStarted ? currentActiveRound.teamB : undefined,
        games: currentActiveRound.games.map((game) =>
            ({ stage: game.stage, mode: game.mode, winner: game.winner, color: game.color })),
    };

    const newValue = activeRound.value;
    newValue.round = {
        id: data.roundId,
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
    ack(null, newValue);
});

nodecg.listenFor('updateActiveGames', (data: UpdateActiveGamesRequest) => {
    activeRound.value.games = clone(data.games);
    const roundStoreValue = rounds.value[activeRound.value.round.id];
    if (roundStoreValue) {
        roundStoreValue.games = clone(data.games);
    }
});

nodecg.listenFor('updateRoundStore', (data: UpdateRoundStoreRequest) => {
    const roundStoreValue = rounds.value[data.id];
    const originalValue = clone(roundStoreValue);

    const mappedGames = clone(data.games).map((game, index) =>
        ({ ...game, winner: originalValue?.games[index]?.winner || GameWinner.NO_WINNER }));

    if (!roundStoreValue) {
        rounds.value[data.id] = {
            games: mappedGames,
            meta: {
                name: data.roundName,
                isCompleted: false
            }
        };
    } else {
        roundStoreValue.games = mappedGames;
        roundStoreValue.meta.name = data.roundName;
    }

    if (activeRound.value.round.id === data.id) {
        activeRound.value.round.name = data.roundName;
        activeRound.value.games = data.games.map((game, index) =>
            ({ ...activeRound.value.games[index], ...game }));
    }
});

rounds.on('change', newValue => {
    console.log(newValue);
});
