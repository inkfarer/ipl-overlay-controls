import * as nodecgContext from './util/nodecg';
import { ActiveRoundId, GameData, SetWinnersAutomatically, TeamScores, Rounds } from 'schemas';
import { GameWinner } from 'types/gameWinner';
import { createEmptyGameData } from '../helpers/gameDataHelper';

const nodecg = nodecgContext.get();

const gameData = nodecg.Replicant<GameData>('gameData');
const teamScores = nodecg.Replicant<TeamScores>('teamScores');
const setWinnersAutomatically = nodecg.Replicant<SetWinnersAutomatically>('setWinnersAutomatically');
const activeRoundId = nodecg.Replicant<ActiveRoundId>('activeRoundId');
const rounds = nodecg.Replicant<Rounds>('rounds');

teamScores.on('change', (newValue, oldValue) => {
    if (!setWinnersAutomatically.value || !oldValue) return;

    const scoreSum = newValue.teamA + newValue.teamB;
    if (scoreSum === 1) {
        if (newValue.teamA === 1) {
            gameData.value[0].winner = GameWinner.ALPHA;
        } else gameData.value[0].winner = GameWinner.BRAVO;
    }

    if (scoreSum >= 2 && gameData.value[0].winner !== GameWinner.NO_WINNER) {
        if (newValue.teamA === oldValue.teamA) {
            // Team b score has changed
            gameData.value[scoreSum - 1].winner = GameWinner.BRAVO;
        } else {
            // Team a score has changed
            gameData.value[scoreSum - 1].winner = GameWinner.ALPHA;
        }
    }
});

activeRoundId.on('change', (newValue, oldValue) => {
    if (oldValue) {
        gameData.value = createEmptyGameData(rounds.value[newValue].games.length);
    }
});
