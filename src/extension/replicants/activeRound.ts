import * as nodecgContext from '../helpers/nodecg';
import { ActiveRound, NextRound, SwapColorsInternally } from 'schemas';
import {
    SetActiveColorRequest,
    SetWinnerRequest,
    UpdateActiveGamesRequest,
    SwapRoundColorRequest
} from 'types/messages/activeRound';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import { GameWinner } from 'types/enums/gameWinner';
import clone from 'clone';
import { commitActiveRoundToMatchStore } from './matchStore';
import { SetRoundRequest } from 'types/messages/rounds';
import { setActiveRoundGames, setActiveRoundTeams, setWinner } from './activeRoundHelper';
import findLastIndex from 'lodash/findLastIndex';
import { generateId } from '../../helpers/generateId';
import { BeginNextMatchRequest } from '../../types/messages/activeRound';
import { isBlank } from '../../helpers/stringHelper';
import cloneDeep from 'lodash/cloneDeep';

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
        const newActiveRound = cloneDeep(activeRound.value);
        setActiveRoundTeams(newActiveRound, data.teamAId, data.teamBId);
        if (data.matchId) {
            setActiveRoundGames(newActiveRound, data.matchId);
        }
        if (!isBlank(data.matchName) && activeRound.value.match.name !== data.matchName) {
            activeRound.value.match.name = data.matchName;
            newActiveRound.match.name = data.matchName;
        }
        activeRound.value = newActiveRound;
    } catch (e) {
        return ack(e);
    }

    commitActiveRoundToMatchStore();
});

nodecg.listenFor('resetActiveRound', () => {
    activeRound.value.teamA.score = 0;
    activeRound.value.teamB.score = 0;
    activeRound.value.games = activeRound.value.games.map(game =>
        ({ ...game, winner: GameWinner.NO_WINNER, color: undefined }));
    commitActiveRoundToMatchStore();
});

nodecg.listenFor('updateActiveGames', (data: UpdateActiveGamesRequest) => {
    activeRound.value.games = clone(data.games);
    commitActiveRoundToMatchStore();
});

nodecg.listenFor('beginNextMatch', (data: BeginNextMatchRequest, ack: UnhandledListenForCb) => {
    if (isBlank(data.matchName)) {
        return ack(new Error('Match name must not be blank'));
    }

    activeRound.value = {
        ...activeRound.value,
        teamA: {
            color: activeRound.value.teamA.color,
            ...clone(nextRound.value.teamA),
            score: 0
        },
        teamB: {
            color: activeRound.value.teamB.color,
            ...clone(nextRound.value.teamB),
            score: 0
        },
        games: nextRound.value.games.map(game =>
            ({ ...game, winner: GameWinner.NO_WINNER, color: undefined })),
        match: {
            id: generateId(),
            name: data.matchName,
            isCompleted: false
        }
    };

    commitActiveRoundToMatchStore();
    nextRound.value.showOnStream = false;
});

nodecg.listenFor('setActiveColor', (data: SetActiveColorRequest) => {
    activeRound.value.activeColor = {
        categoryName: data.categoryName,
        index: data.color.index,
        title: data.color.title,
        isCustom: data.color.isCustom
    };
    activeRound.value.teamA.color = data.color.clrA;
    activeRound.value.teamB.color = data.color.clrB;
});

nodecg.listenFor('swapRoundColor', (data: SwapRoundColorRequest) => {
    const existingColor = activeRound.value.games[data.roundIndex]?.color;

    if (!existingColor || existingColor.colorsSwapped === data.colorsSwapped) return;

    activeRound.value.games[data.roundIndex].color = {
        ...existingColor,
        clrA: existingColor.clrB,
        clrB: existingColor.clrA,
        colorsSwapped: !existingColor.colorsSwapped
    };
});
