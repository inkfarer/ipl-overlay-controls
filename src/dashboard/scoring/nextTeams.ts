import { NextTeams } from 'schemas';
import { scoreboardData, teamScores, tournamentData } from './replicants';
import { addChangeReminder } from '../globalScripts';

const nextTeams = nodecg.Replicant<NextTeams>('nextTeams');

nextTeams.on('change', newValue => {
    (document.getElementById('next-team-a-selector') as HTMLSelectElement).value =
        newValue.teamAInfo.id;
    (document.getElementById('next-team-b-selector') as HTMLSelectElement).value =
        newValue.teamBInfo.id;
});

document.getElementById('update-next-teams-btn').onclick = () => {
    const teamAInfo = tournamentData.value.data.filter(
        team =>
            team.id === (document.getElementById('next-team-a-selector') as HTMLSelectElement).value
    )[0];
    const teamBInfo = tournamentData.value.data.filter(
        team =>
            team.id === (document.getElementById('next-team-b-selector') as HTMLSelectElement).value
    )[0];

    nextTeams.value.teamAInfo = teamAInfo;
    nextTeams.value.teamBInfo = teamBInfo;
};

document.getElementById('begin-next-match-btn').onclick = () => {
    scoreboardData.value.teamAInfo = nextTeams.value.teamAInfo;
    scoreboardData.value.teamBInfo = nextTeams.value.teamBInfo;

    teamScores.value = {
        teamA: 0,
        teamB: 0
    };
};

addChangeReminder(
    document.querySelectorAll('.next-team-update-warning'),
    document.getElementById('update-next-teams-btn') as HTMLButtonElement
);
