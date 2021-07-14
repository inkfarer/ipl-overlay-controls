import { activeRound, nextTeams, tournamentData } from './replicants';
import { addDots, addSelector, clearSelectors } from '../globalScripts';
import { ActiveRound, NextTeams } from 'schemas';

export function updateTeamSelectors(activeRound: ActiveRound): void {
    (document.getElementById('team-a-selector') as HTMLSelectElement).value = activeRound.teamA.id;
    (document.getElementById('team-b-selector') as HTMLSelectElement).value = activeRound.teamB.id;
}

export function updateNextTeamSelectors(nextTeams: NextTeams): void {
    (document.getElementById('next-team-a-selector') as HTMLSelectElement).value = nextTeams.teamAInfo.id;
    (document.getElementById('next-team-b-selector') as HTMLSelectElement).value = nextTeams.teamBInfo.id;
}

NodeCG.waitForReplicants(activeRound, nextTeams).then(() => {
    tournamentData.on('change', newValue => {
        clearSelectors('team-selector');
        for (let i = 0; i < newValue.teams.length; i++) {
            const element = newValue.teams[i];
            addSelector(addDots(element.name), 'team-selector', element.id);
        }

        updateTeamSelectors(activeRound.value);
        updateNextTeamSelectors(nextTeams.value);
    });
});
