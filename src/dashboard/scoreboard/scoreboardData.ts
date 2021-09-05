import { addChangeReminder, setToggleButtonDisabled } from '../helpers/buttonHelper';
import { scoreboardData } from './replicants';

const showScoreboardButton = document.getElementById('show-scoreboard-btn') as HTMLButtonElement;
const hideScoreboardButton = document.getElementById('hide-scoreboard-btn') as HTMLButtonElement;

scoreboardData.on('change', newValue => {
    (document.getElementById('flavor-text-input') as HTMLInputElement).value = newValue.flavorText;
    setToggleButtonDisabled(showScoreboardButton, hideScoreboardButton, newValue.isVisible);
});

document.getElementById('update-scoreboard-btn').addEventListener('click', () => {
    scoreboardData.value.flavorText = (document.getElementById('flavor-text-input') as HTMLInputElement).value;
});

addChangeReminder(
    document.querySelectorAll('.scoreboard-update-warning'),
    document.getElementById('update-scoreboard-btn') as HTMLButtonElement
);

showScoreboardButton.addEventListener('click', () => { scoreboardData.value.isVisible = true; });
hideScoreboardButton.addEventListener('click', () => { scoreboardData.value.isVisible = false; });

document.getElementById('show-casters-btn').addEventListener('click', () => {
    nodecg.sendMessage('mainShowCasters');
});
