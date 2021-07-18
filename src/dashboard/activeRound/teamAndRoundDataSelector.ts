import { activeRound, roundStore, tournamentData } from './replicants';
import { ActiveRound } from 'schemas';
import { addChangeReminder, addDots, addSelector, clearSelectors, createSelector } from '../globalScripts';
import { SetRoundRequest } from 'types/messages/rounds';

const roundSelector = document.getElementById('round-selector') as HTMLSelectElement;
const teamASelector = document.getElementById('team-a-selector') as HTMLSelectElement;
const teamBSelector = document.getElementById('team-b-selector') as HTMLSelectElement;
const updateActiveRoundButton = document.getElementById('update-active-round-button') as HTMLButtonElement;
const roundDataInfoElem = document.getElementById('round-data-info') as HTMLDivElement;
const roundDataInfoText = roundDataInfoElem.querySelector('.content') as HTMLDivElement;

NodeCG.waitForReplicants(activeRound, tournamentData, roundStore).then(() => {
    activeRound.on('change', newValue => {
        updateTeamSelectors(newValue);
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

function checkRoundProgress() {
    const selectedRound = roundSelector.options[roundSelector.selectedIndex];
    if (selectedRound
        && selectedRound.value !== activeRound.value.round.id
        && selectedRound.dataset.teamAId
        && selectedRound.dataset.teamBId) {
        if (selectedRound.dataset.isCompleted === 'true') {
            roundDataInfoText.innerText = `'${selectedRound.text}' has already been completed.`;
        } else {
            roundDataInfoText.innerText = `'${selectedRound.text}' already has saved progress.`;
        }

        teamASelector.value = selectedRound.dataset.teamAId;
        teamBSelector.value = selectedRound.dataset.teamBId;
        roundDataInfoText.innerText += `\n(${selectedRound.dataset.teamAName} vs ${selectedRound.dataset.teamBName})`;
        roundDataInfoElem.style.display = '';
    } else {
        roundDataInfoElem.style.display = 'none';
    }
}

function updateTeamSelectors(activeRound: ActiveRound): void {
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