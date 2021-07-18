import * as nodecgContext from '../helpers/nodecg';
import { ActiveRound, NextRound, RoundStore, SwapColorsInternally, TournamentData } from 'schemas';
import { SetActiveColorRequest, SetWinnerRequest, UpdateActiveGamesRequest } from 'types/messages/activeRound';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import { GameWinner } from 'types/gameWinner';
import clone from 'clone';
import { getTeam } from '../helpers/tournamentDataHelper';
import isEmpty from 'lodash/isEmpty';
import { commitActiveRoundToRoundStore } from './roundStore';
import { SetRoundRequest } from 'types/messages/rounds';

const nodecg = nodecgContext.get();

const activeRound = nodecg.Replicant<ActiveRound>('activeRound');
const nextRound = nodecg.Replicant<NextRound>('nextRound');
const roundStore = nodecg.Replicant<RoundStore>('roundStore');
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

nodecg.listenFor('setActiveRound', (data: SetRoundRequest, ack: UnhandledListenForCb) => {
    const teamA = getTeam(data.teamAId, tournamentData.value);
    const teamB = getTeam(data.teamBId, tournamentData.value);
    if ([teamA, teamB].filter(isEmpty).length > 0) {
        return ack(new Error('Could not find a team.'));
    }

    activeRound.value.teamA = {
        ...activeRound.value.teamA,
        ...teamA
    };
    activeRound.value.teamB = {
        ...activeRound.value.teamB,
        ...teamB
    };

    if (data.roundId) {
        try {
            setActiveRoundGames(data.roundId);
        } catch (e) {
            ack(e);
        }
    }

    commitActiveRoundToRoundStore();
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
        games: nextRound.value.games.map(game =>
            ({ ...game, winner: GameWinner.NO_WINNER, color: undefined })),
        round: {
            ...nextRound.value.round
        }
    };

    commitActiveRoundToRoundStore(true);
});

nodecg.listenFor('setActiveColor', (data: SetActiveColorRequest) => {
    const isCustomColor = data.categoryName === 'Custom Color';

    activeRound.value.activeColor = {
        categoryName: isCustomColor ? 'Custom Color' : data.categoryName,
        index: data.color.index,
        title: data.color.title
    };
    activeRound.value.teamA.color = data.color.clrA;
    activeRound.value.teamB.color = data.color.clrB;
});

export function setActiveRoundGames(roundId: string): void {
    const round = roundStore.value[roundId];
    if (isEmpty(round)) {
        throw new Error(`Could not find round ${roundId}.`);
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
