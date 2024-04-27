import type NodeCG from '@nodecg/types';
import * as nodecgContext from '../helpers/nodecg';
import { ActiveRound, NextRound, SwapColorsInternally } from 'schemas';
import {
    SetActiveColorRequest,
    SetWinnerRequest,
    UpdateActiveGamesRequest,
    SwapRoundColorRequest
} from 'types/messages/activeRound';
import { GameWinner } from 'types/enums/gameWinner';
import clone from 'clone';
import { commitActiveRoundToMatchStore } from './matchStore';
import { SetRoundRequest } from 'types/messages/rounds';
import { setActiveRoundGames, setActiveRoundTeams, setWinner } from '../helpers/activeRoundHelper';
import findLastIndex from 'lodash/findLastIndex';
import { generateId } from '../../helpers/generateId';
import { BeginNextMatchRequest } from 'types/messages/activeRound';
import { isBlank } from '../../helpers/stringHelper';
import cloneDeep from 'lodash/cloneDeep';
import { getNextColor, getPreviousColor, setActiveColor } from '../helpers/activeColorHelper';

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

nodecg.listenFor('removeWinner', (data: never, ack: NodeCG.UnhandledAcknowledgement) => {
    try {
        const lastWinnerIndex = findLastIndex(activeRound.value.games, game => game.winner !== GameWinner.NO_WINNER);
        if (lastWinnerIndex < 0) return;
        setWinner(lastWinnerIndex, GameWinner.NO_WINNER);
    } catch (e) {
        ack(e);
    }
});

nodecg.listenFor('setWinner', (data: SetWinnerRequest, ack: NodeCG.UnhandledAcknowledgement) => {
    const scoreSum = activeRound.value.teamA.score + activeRound.value.teamB.score;
    const index = data.roundIndex != null ? data.roundIndex : scoreSum;

    if (index === 0 && data.winner !== GameWinner.NO_WINNER) {
        nextRound.value.showOnStream = false;
    }

    try {
        setWinner(index, data.winner);
    } catch (e) {
        ack(e);
    }
});

nodecg.listenFor('setActiveRound', (data: SetRoundRequest, ack: NodeCG.UnhandledAcknowledgement) => {
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

nodecg.listenFor('beginNextMatch', (data?: BeginNextMatchRequest) => {
    const matchName = isBlank(data?.matchName) ? nextRound.value.name : data.matchName;

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
            name: matchName,
            isCompleted: false,
            type: nextRound.value.round.type
        }
    };

    commitActiveRoundToMatchStore();
});

nodecg.listenFor('setActiveColor', (data: SetActiveColorRequest) => {
    setActiveColor(data);
});

export function switchToNextColor(): void {
    if (activeRound.value.activeColor.isCustom) return;

    const nextColor = getNextColor();

    setActiveColor({
        color: nextColor,
        categoryName: nextColor.categoryName,
        categoryKey: nextColor.categoryKey
    });
}

export function switchToPreviousColor(): void {
    if (activeRound.value.activeColor.isCustom) return;

    const previousColor = getPreviousColor();

    setActiveColor({
        color: previousColor,
        categoryName: previousColor.categoryName,
        categoryKey: previousColor.categoryKey
    });
}

nodecg.listenFor('switchToNextColor', () => {
    switchToNextColor();
});

nodecg.listenFor('switchToPreviousColor', () => {
    switchToPreviousColor();
});

nodecg.listenFor('getNextAndPreviousColors', (data: never, ack: NodeCG.UnhandledAcknowledgement) => {
    ack(null, {
        nextColor: getNextColor(),
        previousColor: getPreviousColor()
    });
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
