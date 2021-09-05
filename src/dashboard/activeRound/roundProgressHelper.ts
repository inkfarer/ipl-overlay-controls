import { activeRound } from './replicants';

const roundSelector = document.getElementById('round-selector') as HTMLSelectElement;
const roundDataInfoElem = document.getElementById('round-data-info') as HTMLDivElement;
const roundDataInfoText = roundDataInfoElem.querySelector('.content') as HTMLDivElement;
const teamASelector = document.getElementById('team-a-selector') as HTMLSelectElement;
const teamBSelector = document.getElementById('team-b-selector') as HTMLSelectElement;

export function checkRoundProgress(): void {
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
        } else {
            roundDataInfoElem.style.display = 'none';
        }

        teamASelector.value = selectedRoundOption.dataset.teamAId;
        teamBSelector.value = selectedRoundOption.dataset.teamBId;
    } else {
        roundDataInfoElem.style.display = 'none';
    }
}
