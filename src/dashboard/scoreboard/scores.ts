import { activeRound } from './replicants';
import { SetWinnerRequest } from 'types/messages/activeRound';
import { GameWinner } from 'types/enums/gameWinner';
import last from 'lodash/last';

const teamAScoreAddButton = document.getElementById('team-a-score-plus-btn') as HTMLButtonElement;
const teamBScoreAddButton = document.getElementById('team-b-score-plus-btn') as HTMLButtonElement;
const teamAScoreSubButton = document.getElementById('team-a-score-minus-btn') as HTMLButtonElement;
const teamBScoreSubButton = document.getElementById('team-b-score-minus-btn') as HTMLButtonElement;

activeRound.on('change', newValue => {
    (document.getElementById('team-a-score-input') as HTMLInputElement).value = newValue.teamA.score.toString();
    (document.getElementById('team-b-score-input') as HTMLInputElement).value = newValue.teamB.score.toString();

    const finalGameCompleted = newValue.teamA.score + newValue.teamB.score >= newValue.games.length;
    teamAScoreAddButton.disabled = finalGameCompleted;
    teamBScoreAddButton.disabled = finalGameCompleted;

    const lastWinner = last(newValue.games.filter(game => game.winner !== GameWinner.NO_WINNER))?.winner;
    teamAScoreSubButton.disabled = lastWinner === GameWinner.BRAVO || lastWinner == null;
    teamBScoreSubButton.disabled = lastWinner === GameWinner.ALPHA || lastWinner == null;
});

teamAScoreAddButton.addEventListener('click', () => {
    nodecg.sendMessage('setWinner', { winner: GameWinner.ALPHA } as SetWinnerRequest);
});
teamAScoreSubButton.addEventListener('click', () => {
    nodecg.sendMessage('removeWinner');
});
teamBScoreAddButton.addEventListener('click', () => {
    nodecg.sendMessage('setWinner', { winner: GameWinner.BRAVO } as SetWinnerRequest);
});
teamBScoreSubButton.addEventListener('click', () => {
    nodecg.sendMessage('removeWinner');
});
