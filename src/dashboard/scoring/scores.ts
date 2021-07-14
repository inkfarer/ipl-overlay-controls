import { activeRound } from './replicants';

activeRound.on('change', newValue => {
    console.log(newValue);
    (document.getElementById('team-a-score-input') as HTMLInputElement).value = newValue.teamA.score.toString();
    (document.getElementById('team-b-score-input') as HTMLInputElement).value = newValue.teamB.score.toString();
});

document.getElementById('team-a-score-plus-btn').onclick = () => {
    activeRound.value.teamA.score++;
};

document.getElementById('team-a-score-minus-btn').onclick = () => {
    activeRound.value.teamA.score--;
};

document.getElementById('team-b-score-plus-btn').onclick = () => {
    activeRound.value.teamB.score++;
};

document.getElementById('team-b-score-minus-btn').onclick = () => {
    activeRound.value.teamB.score--;
};

document.getElementById('team-a-score-input').oninput = event => {
    activeRound.value.teamA.score = Number((event.target as HTMLInputElement).value);
};

document.getElementById('team-b-score-input').oninput = event => {
    activeRound.value.teamB.score = Number((event.target as HTMLInputElement).value);
};
