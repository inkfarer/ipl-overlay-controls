import * as nodecgContext from './util/nodecg';
import {
    ActiveRoundId,
    GameData,
    SetWinnersAutomatically,
    TeamScores,
    Rounds,
    ScoreboardData,
    SwapColorsInternally
} from 'schemas';
import { GameWinner } from 'types/gameWinner';
import { createEmptyGameData } from '../helpers/gameDataHelper';
import clone from 'clone';

const nodecg = nodecgContext.get();

const gameData = nodecg.Replicant<GameData>('gameData');
const teamScores = nodecg.Replicant<TeamScores>('teamScores');
const setWinnersAutomatically = nodecg.Replicant<SetWinnersAutomatically>('setWinnersAutomatically');
const activeRoundId = nodecg.Replicant<ActiveRoundId>('activeRoundId');
const rounds = nodecg.Replicant<Rounds>('rounds');
const scoreboardData = nodecg.Replicant<ScoreboardData>('scoreboardData');
const swapColorsInternally = nodecg.Replicant<SwapColorsInternally>('swapColorsInternally');

teamScores.on('change', (newValue, oldValue) => {
    if (!oldValue) return;
    const scoreSum = newValue.teamA + newValue.teamB;
    const gameDataIndex = Math.max(scoreSum - 1, 0);
    const newGameData = clone(gameData.value[gameDataIndex]);

    newGameData.color = {
        ...scoreboardData.value.colorInfo,
        colorsSwapped: swapColorsInternally.value
    };

    if (setWinnersAutomatically.value) {
        if (scoreSum === 1) {
            if (newValue.teamA === 1) {
                newGameData.winner = GameWinner.ALPHA;
            } else newGameData.winner = GameWinner.BRAVO;
        }

        if (scoreSum >= 2 && gameData.value[0].winner !== GameWinner.NO_WINNER) {
            if (newValue.teamA === oldValue.teamA) {
                // Team b score has changed
                newGameData.winner = GameWinner.BRAVO;
            } else {
                // Team a score has changed
                newGameData.winner = GameWinner.ALPHA;
            }
        }
    }

    gameData.value[gameDataIndex] = newGameData;
});

activeRoundId.on('change', (newValue, oldValue) => {
    if (oldValue) {
        gameData.value = createEmptyGameData(rounds.value[newValue].games.length);
    }
});
