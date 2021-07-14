import { addChangeReminder, addDots, addSelector, clearSelectors } from '../globalScripts';
import { NextTeams, TeamImageHidden, TournamentData } from 'schemas';

const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');
const nextTeams = nodecg.Replicant<NextTeams>('nextTeams');
const teamImageHidden = nodecg.Replicant<TeamImageHidden>('teamImageHidden');

const nextTeamASelector = document.getElementById('next-team-a-selector') as HTMLSelectElement;
const nextTeamBSelector = document.getElementById('next-team-b-selector') as HTMLSelectElement;
const nextTeamUpdateBtn = document.getElementById('update-next-teams-btn') as HTMLButtonElement;
const teamAImageToggle = document.getElementById('team-a-image-toggle') as HTMLInputElement;
const teamBImageToggle = document.getElementById('team-b-image-toggle') as HTMLInputElement;

function updateNextTeamSelectors(nextTeams: NextTeams): void {
    nextTeamASelector.value = nextTeams.teamAInfo.id;
    nextTeamBSelector.value = nextTeams.teamBInfo.id;
}

tournamentData.on('change', newValue => {
    clearSelectors('team-selector');
    for (let i = 0; i < newValue.teams.length; i++) {
        const element = newValue.teams[i];
        addSelector(addDots(element.name), 'team-selector', element.id);
    }

    updateNextTeamSelectors(nextTeams.value);
});

nextTeams.on('change', newValue => {
    updateNextTeamSelectors(newValue);
});

nextTeamUpdateBtn.onclick = () => {
    const teamAInfo = tournamentData.value.teams.filter(team => team.id === nextTeamASelector.value)[0];
    const teamBInfo = tournamentData.value.teams.filter(team => team.id === nextTeamBSelector.value)[0];

    nextTeams.value.teamAInfo = teamAInfo;
    nextTeams.value.teamBInfo = teamBInfo;
};

addChangeReminder(document.querySelectorAll('.teams-update-reminder'), nextTeamUpdateBtn);

teamImageHidden.on('change', newValue => {
    teamAImageToggle.checked = newValue.teamA;
    teamBImageToggle.checked = newValue.teamB;
});

teamAImageToggle.onclick = e => {
    teamImageHidden.value.teamA = (e.target as HTMLInputElement).checked;
};

teamBImageToggle.onclick = e => {
    teamImageHidden.value.teamB = (e.target as HTMLInputElement).checked;
};
