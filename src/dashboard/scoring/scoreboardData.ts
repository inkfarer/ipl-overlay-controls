import { addChangeReminder, addDots, addSelector, clearSelectors, setToggleButtonDisabled } from '../globalScripts';
import { scoreboardData, scoreboardShown, tournamentData } from './replicants';

scoreboardData.on('change', newValue => {
    (document.getElementById('flavor-text-input') as HTMLInputElement).value = newValue.flavorText;

    (document.getElementById('team-a-selector') as HTMLSelectElement).value = newValue.teamAInfo.id;
    (document.getElementById('team-b-selector') as HTMLSelectElement).value = newValue.teamBInfo.id;
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
    document.getElementById('update-scoreboard-btn')
);

scoreboardShown.on('change', newValue => {
    setToggleButtonDisabled(
        document.getElementById('show-scoreboard-btn'),
        document.getElementById('hide-scoreboard-btn'),
        newValue
    );
});

document.getElementById('show-scoreboard-btn').onclick = () => { scoreboardShown.value = true; };
document.getElementById('hide-scoreboard-btn').onclick = () => { scoreboardShown.value = false; };

document.getElementById('show-casters-btn').onclick = () => {
    nodecg.sendMessage('mainShowCasters');
};
