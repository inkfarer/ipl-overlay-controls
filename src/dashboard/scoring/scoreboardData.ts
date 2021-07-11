import { addChangeReminder, addDots, addSelector, clearSelectors, setToggleButtonDisabled } from '../globalScripts';
import { scoreboardData, tournamentData } from './replicants';

scoreboardData.on('change', newValue => {
    (document.getElementById('flavor-text-input') as HTMLInputElement).value = newValue.flavorText;

    (document.getElementById('team-a-selector') as HTMLSelectElement).value = newValue.teamAInfo.id;
    (document.getElementById('team-b-selector') as HTMLSelectElement).value = newValue.teamBInfo.id;

    setToggleButtonDisabled(
        document.getElementById('show-scoreboard-btn') as HTMLButtonElement,
        document.getElementById('hide-scoreboard-btn') as HTMLButtonElement,
        newValue.isVisible
    );
});

tournamentData.on('change', newValue => {
    clearSelectors('team-selector');
    for (let i = 0; i < newValue.data.length; i++) {
        const element = newValue.data[i];
        addSelector(addDots(element.name), 'team-selector', element.id);
    }
});

document.getElementById('update-scoreboard-btn').addEventListener('click', () => {
    const teamAInfo = tournamentData.value.data.filter(
        team => team.id === (document.getElementById('team-a-selector') as HTMLSelectElement).value
    )[0];
    const teamBInfo = tournamentData.value.data.filter(
        team => team.id === (document.getElementById('team-b-selector') as HTMLSelectElement).value
    )[0];

    scoreboardData.value.teamAInfo = teamAInfo;
    scoreboardData.value.teamBInfo = teamBInfo;
    scoreboardData.value.flavorText = (document.getElementById('flavor-text-input') as HTMLInputElement).value;
});

addChangeReminder(
    document.querySelectorAll('.scoreboard-update-warning'),
    document.getElementById('update-scoreboard-btn') as HTMLButtonElement
);

document.getElementById('show-scoreboard-btn').onclick = () => { scoreboardData.value.isVisible = true; };
document.getElementById('hide-scoreboard-btn').onclick = () => { scoreboardData.value.isVisible = false; };

document.getElementById('show-casters-btn').onclick = () => {
    nodecg.sendMessage('mainShowCasters');
};
