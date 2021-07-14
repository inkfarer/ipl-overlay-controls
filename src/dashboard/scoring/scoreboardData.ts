import { addChangeReminder, addDots, addSelector, clearSelectors, setToggleButtonDisabled } from '../globalScripts';
import { activeRound, scoreboardData, tournamentData } from './replicants';
import { Team } from 'types/team';

activeRound.on('change', newValue => {
    (document.getElementById('team-a-selector') as HTMLSelectElement).value = newValue.teamA.id;
    (document.getElementById('team-b-selector') as HTMLSelectElement).value = newValue.teamB.id;
});

scoreboardData.on('change', newValue => {
    (document.getElementById('flavor-text-input') as HTMLInputElement).value = newValue.flavorText;

    setToggleButtonDisabled(
        document.getElementById('show-scoreboard-btn') as HTMLButtonElement,
        document.getElementById('hide-scoreboard-btn') as HTMLButtonElement,
        newValue.isVisible
    );
});

tournamentData.on('change', newValue => {
    clearSelectors('team-selector');
    for (let i = 0; i < newValue.teams.length; i++) {
        const element = newValue.teams[i];
        addSelector(addDots(element.name), 'team-selector', element.id);
    }
});

document.getElementById('update-scoreboard-btn').addEventListener('click', () => {
    const teamAInfo = getTeam((document.getElementById('team-a-selector') as HTMLSelectElement).value);
    const teamBInfo = getTeam((document.getElementById('team-b-selector') as HTMLSelectElement).value);

    activeRound.value.teamA = {
        ...activeRound.value.teamA,
        ...teamAInfo
    };
    activeRound.value.teamB = {
        ...activeRound.value.teamB,
        ...teamBInfo
    };

    scoreboardData.value.flavorText = (document.getElementById('flavor-text-input') as HTMLInputElement).value;
});

function getTeam(id: string): Team {
    return tournamentData.value.teams.filter(
        team => team.id === id
    )[0];
}

addChangeReminder(
    document.querySelectorAll('.scoreboard-update-warning'),
    document.getElementById('update-scoreboard-btn') as HTMLButtonElement
);

document.getElementById('show-scoreboard-btn').onclick = () => { scoreboardData.value.isVisible = true; };
document.getElementById('hide-scoreboard-btn').onclick = () => { scoreboardData.value.isVisible = false; };

document.getElementById('show-casters-btn').onclick = () => {
    nodecg.sendMessage('mainShowCasters');
};
