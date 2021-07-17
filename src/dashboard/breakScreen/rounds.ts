import { addChangeReminder, clearSelectors } from '../globalScripts';
import { ActiveRound, RoundStore } from 'schemas';
import { SetActiveRoundRequest } from 'types/messages/activeRound';

const rounds = nodecg.Replicant<RoundStore>('roundStore');
const activeRound = nodecg.Replicant<ActiveRound>('activeRound');

const currentStageUpdateButton = document.getElementById('current-round-update-btn') as HTMLButtonElement;
const roundSelector = document.getElementById('round-selector') as HTMLSelectElement;

NodeCG.waitForReplicants(rounds, activeRound).then(() => {
    rounds.on('change', newValue => {
        clearSelectors('round-selector');
        for (const [key, value] of Object.entries(newValue)) {
            const opt = document.createElement('option');
            opt.value = key;
            opt.text = value.meta.name;
            roundSelector.appendChild(opt);
        }

        roundSelector.value = activeRound.value.round.id;
    });

    activeRound.on('change', newValue => {
        roundSelector.value = newValue.round.id;
    });
});

currentStageUpdateButton.onclick = () => {
    nodecg.sendMessage('setActiveRound', { roundId: roundSelector.value } as SetActiveRoundRequest);
};

addChangeReminder([roundSelector], currentStageUpdateButton);
