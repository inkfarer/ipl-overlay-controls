import { teamScores } from './replicants';

teamScores.on('change', newValue => {
    (document.getElementById('team-a-score-input') as HTMLInputElement).value = newValue.teamA.toString();
    (document.getElementById('team-b-score-input') as HTMLInputElement).value = newValue.teamB.toString();
});

document.getElementById('team-a-score-plus-btn').onclick = () => {
    teamScores.value.teamA++;
};

document.getElementById('team-a-score-minus-btn').onclick = () => {
    teamScores.value.teamA--;
};

document.getElementById('team-b-score-plus-btn').onclick = () => {
    teamScores.value.teamB++;
};

document.getElementById('team-b-score-minus-btn').onclick = () => {
    teamScores.value.teamB--;
};

document.getElementById('team-a-score-input').oninput = event => {
    teamScores.value.teamA = Number((event.target as HTMLInputElement).value);
};

document.getElementById('team-b-score-input').oninput = event => {
    teamScores.value.teamB = Number((event.target as HTMLInputElement).value);
};
