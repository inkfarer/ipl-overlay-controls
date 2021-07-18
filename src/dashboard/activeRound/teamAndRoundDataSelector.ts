import { activeRound, roundStore, tournamentData } from './replicants';
import { ActiveRound } from 'schemas';
import { addChangeReminder, addDots, addSelector, clearSelectors, createSelector } from '../globalScripts';
import { SetRoundRequest } from 'types/messages/rounds';
import { ToggleTeamImageRequest } from 'types/messages/tournamentData';

const roundSelector = document.getElementById('round-selector') as HTMLSelectElement;
const teamASelector = document.getElementById('team-a-selector') as HTMLSelectElement;
const teamBSelector = document.getElementById('team-b-selector') as HTMLSelectElement;
const updateActiveRoundButton = document.getElementById('update-active-round-button') as HTMLButtonElement;
const roundDataInfoElem = document.getElementById('round-data-info') as HTMLDivElement;
const roundDataInfoText = roundDataInfoElem.querySelector('.content') as HTMLDivElement;
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

function handleTeamImageToggleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const teamId = target.dataset.teamId;
    if (!teamId) {
        throw new Error('Team image toggle has no team ID set');
    }

    nodecg.sendMessage('toggleTeamImage', { teamId: teamId, isVisible: target.checked } as ToggleTeamImageRequest);
}

function checkRoundProgress() {
    const selectedRoundOption = roundSelector.options[roundSelector.selectedIndex];
    if (selectedRoundOption
        && selectedRoundOption.dataset.teamAId
        && selectedRoundOption.dataset.teamBId) {

        if (selectedRoundOption.value !== activeRound.value.round.id) {
            if (selectedRoundOption.dataset.isCompleted === 'true') {
                roundDataInfoText.innerText = `'${selectedRoundOption.text}' has already been completed.`;
            } else {
                roundDataInfoText.innerText = `'${selectedRoundOption.text}' already has saved progress.`;
            }

            roundDataInfoText.innerText
                += `\n(${selectedRoundOption.dataset.teamAName} vs ${selectedRoundOption.dataset.teamBName})`;
            roundDataInfoElem.style.display = '';
        }

        teamASelector.value = selectedRoundOption.dataset.teamAId;
        teamBSelector.value = selectedRoundOption.dataset.teamBId;
    } else {
        roundDataInfoElem.style.display = 'none';
    }
}

function updateTeamSelectors(activeRound: ActiveRound): void {
    teamASelector.value = activeRound.teamA.id;
    teamBSelector.value = activeRound.teamB.id;
}

addChangeReminder([roundSelector, teamASelector, teamBSelector], updateActiveRoundButton);
