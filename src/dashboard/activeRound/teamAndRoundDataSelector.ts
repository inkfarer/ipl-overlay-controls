import { activeRound, roundStore, tournamentData } from './replicants';
import { ActiveRound } from 'schemas';
import { addChangeReminder } from '../helpers/buttonHelper';
import { addSelector, clearSelectors, createSelector } from '../helpers/selectHelper';
import { addDots } from '../helpers/stringHelper';
import { SetRoundRequest } from 'types/messages/rounds';
import { handleTeamImageToggleChange } from '../helpers/teamImageToggleHelper';
import { checkRoundProgress } from './roundProgressHelper';

const roundSelector = document.getElementById('round-selector') as HTMLSelectElement;
const teamASelector = document.getElementById('team-a-selector') as HTMLSelectElement;
const teamBSelector = document.getElementById('team-b-selector') as HTMLSelectElement;
const updateActiveRoundButton = document.getElementById('update-active-round-button') as HTMLButtonElement;
const showTeamAImage = document.getElementById('show-team-a-image') as HTMLInputElement;
const showTeamBImage = document.getElementById('show-team-b-image') as HTMLInputElement;

NodeCG.waitForReplicants(activeRound, tournamentData, roundStore).then(() => {
    activeRound.on('change', newValue => {
        updateTeamSelectors(newValue);

        showTeamAImage.checked = newValue.teamA.showLogo;
        showTeamAImage.dataset.teamId = newValue.teamA.id;
        showTeamBImage.checked = newValue.teamB.showLogo;
        showTeamBImage.dataset.teamId = newValue.teamB.id;

        roundSelector.value = newValue.round.id;
        checkRoundProgress();

        document.getElementById('team-a-color-display').style.backgroundColor = newValue.teamA.color;
        document.getElementById('team-b-color-display').style.backgroundColor = newValue.teamB.color;
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
            const opt = createSelector(value.meta.name, key);

            if (value.teamA && value.teamB) {
                opt.dataset.teamAId = value.teamA.id;
                opt.dataset.teamBId = value.teamB.id;
                opt.dataset.teamAName = value.teamA.name;
                opt.dataset.teamBName = value.teamB.name;
                opt.dataset.isCompleted = String(value.meta.isCompleted);
            }

            roundSelector.appendChild(opt);
        }

        roundSelector.value = activeRound.value.round.id;
        checkRoundProgress();
    });
});

roundSelector.addEventListener('change', checkRoundProgress);

updateActiveRoundButton.addEventListener('click', () => {
    nodecg.sendMessage('setActiveRound', {
        roundId: roundSelector.value,
        teamAId: teamASelector.value,
        teamBId: teamBSelector.value
    } as SetRoundRequest);
});

showTeamAImage.addEventListener('change', handleTeamImageToggleChange);
showTeamBImage.addEventListener('change', handleTeamImageToggleChange);

function updateTeamSelectors(activeRound: ActiveRound): void {
    teamASelector.value = activeRound.teamA.id;
    teamBSelector.value = activeRound.teamB.id;
}

addChangeReminder([roundSelector, teamASelector, teamBSelector], updateActiveRoundButton);
