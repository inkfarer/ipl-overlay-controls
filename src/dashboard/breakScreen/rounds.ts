import { addChangeReminder, clearSelectors } from '../globalScripts';
import { ActiveRoundId, Rounds } from 'schemas';

const rounds = nodecg.Replicant<Rounds>('rounds');
const activeRoundId = nodecg.Replicant<ActiveRoundId>('activeRoundId');

const currentStageUpdateButton = document.getElementById('current-round-update-btn') as HTMLButtonElement;
const roundSelector = document.getElementById('round-selector') as HTMLSelectElement;

NodeCG.waitForReplicants(rounds, activeRoundId).then(() => {
    activeRoundId.on('change', newValue => {
        roundSelector.value = newValue;
    });

    rounds.on('change', newValue => {
        clearSelectors('round-selector');
        for (const [key, value] of Object.entries(newValue)) {
            const opt = document.createElement('option');
            opt.value = key;
            opt.text = value.meta.name;
            roundSelector.appendChild(opt);
        }

        roundSelector.value = activeRoundId.value;
    });
});

currentStageUpdateButton.onclick = () => {
    activeRoundId.value = roundSelector.value;
};

addChangeReminder([roundSelector], currentStageUpdateButton);
