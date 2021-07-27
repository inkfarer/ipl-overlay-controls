import * as nodecgContext from '../helpers/nodecg';
import { ActiveRound, NextRound, SwapColorsInternally } from 'schemas';
import { SetActiveColorRequest, SetWinnerRequest, UpdateActiveGamesRequest } from 'types/messages/activeRound';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import { GameWinner } from 'types/enums/gameWinner';
import clone from 'clone';
import { commitActiveRoundToRoundStore } from './roundStore';
import { SetRoundRequest } from 'types/messages/rounds';
import { setActiveRoundGames, setActiveRoundTeams, setWinner } from './activeRoundHelper';
import findLastIndex from 'lodash/findLastIndex';

const nodecg = nodecgContext.get();

const activeRound = nodecg.Replicant<ActiveRound>('activeRound');
const nextRound = nodecg.Replicant<NextRound>('nextRound');
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
        const lastWinnerIndex = findLastIndex(activeRound.value.games, game => game.winner !== GameWinner.NO_WINNER);
        if (lastWinnerIndex < 0) return;
        setWinner(lastWinnerIndex, GameWinner.NO_WINNER);
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

nodecg.listenFor('setActiveRound', (data: SetRoundRequest, ack: UnhandledListenForCb) => {
    try {
        setActiveRoundTeams(data.teamAId, data.teamBId);
        if (data.roundId) {
            setActiveRoundGames(data.roundId);
        }
    } catch (e) {
        return ack(e);
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

nodecg.listenFor('beginNextMatch', () => {
    activeRound.value = {
        ...activeRound.value,
        teamA: {
            ...activeRound.value.teamA,
            ...clone(nextRound.value.teamA),
            score: 0
        },
        teamB: {
            ...activeRound.value.teamB,
            ...clone(nextRound.value.teamB),
            score: 0
        },
        games: nextRound.value.games.map(game =>
            ({ ...game, winner: GameWinner.NO_WINNER, color: undefined })),
        round: {
            ...clone(nextRound.value.round),
            isCompleted: false
        }
    };

    commitActiveRoundToRoundStore(true);
});

nodecg.listenFor('setActiveColor', (data: SetActiveColorRequest) => {
    activeRound.value.activeColor = {
        categoryName: data.categoryName,
        index: data.color.index,
        title: data.color.title
    };
    activeRound.value.teamA.color = data.color.clrA;
    activeRound.value.teamB.color = data.color.clrB;
});
