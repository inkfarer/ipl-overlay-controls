import { activeRound, roundStore, tournamentData } from './replicants';
import { ActiveRound } from 'schemas';
import { addChangeReminder, addDots, addSelector, clearSelectors } from '../globalScripts';
import { SetRoundRequest } from 'types/messages/rounds';

const roundSelector = document.getElementById('round-selector') as HTMLSelectElement;
const teamASelector = document.getElementById('team-a-selector') as HTMLSelectElement;
const teamBSelector = document.getElementById('team-b-selector') as HTMLSelectElement;
const updateActiveRoundButton = document.getElementById('update-active-round-button') as HTMLButtonElement;

NodeCG.waitForReplicants(activeRound, tournamentData, roundStore).then(() => {
    activeRound.on('change', newValue => {
        updateTeamSelectors(newValue);
        roundSelector.value = newValue.round.id;
    });

    tournamentData.on('change', newValue => {
        clearSelectors('team-selector');
        for (let i = 0; i < newValue.teams.length; i++) {
            const element = newValue.teams[i];
            addSelector(addDots(element.name), 'team-selector', element.id);
        }

        updateTeamSelectors(activeRound.value);
    });

    roundStore.on('change', newValue => {
        clearSelectors('round-selector');
        for (const [key, value] of Object.entries(newValue)) {
            const opt = document.createElement('option');
            opt.value = key;
            opt.text = value.meta.name;
            roundSelector.appendChild(opt);
        }

        roundSelector.value = activeRound.value.round.id;
    });
});

export function updateTeamSelectors(activeRound: ActiveRound): void {
    teamASelector.value = activeRound.teamA.id;
    teamBSelector.value = activeRound.teamB.id;
}

updateActiveRoundButton.addEventListener('click', () => {
    nodecg.sendMessage('setActiveRound', {
        roundId: roundSelector.value,
        teamAId: teamASelector.value,
        teamBId: teamBSelector.value
    } as SetRoundRequest);
});

addChangeReminder([roundSelector, teamASelector, teamBSelector], updateActiveRoundButton);
