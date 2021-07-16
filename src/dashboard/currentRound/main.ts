import { activeRound } from './replicants';
import { ActiveRoundGame } from 'types/activeRoundGame';

import './roundUpdater';

import '../styles/globalStyles.css';
import './currentRound.css';
import { addToggle } from './toggleCreator';
import { updateToggles } from './toggleUpdater';
import { SetActiveRoundRequest } from 'types/messages/activeRound';

export const roundNameElem = document.getElementById('round-name');
export const enableColorEditToggle = document.getElementById('enable-color-edit-toggle') as HTMLInputElement;

activeRound.on('change', (newValue, oldValue) => {
    if (!oldValue || newValue.round.id !== oldValue.round.id) {
        addRoundToggles(newValue.games as ActiveRoundGame[], newValue.round.name);
    } else {
        updateToggles(newValue.games as ActiveRoundGame[], newValue.round.name);
    }
});

enableColorEditToggle.addEventListener('change', e => {
    const colorSelectors = document.querySelectorAll('.color-selector-wrapper') as NodeListOf<HTMLDivElement>;
    const selectorDisplay = (e.target as HTMLInputElement).checked ? '' : 'none';
    colorSelectors.forEach(selector => {
        selector.style.display = selectorDisplay;
    });
});

function addRoundToggles(games: ActiveRoundGame[], roundName: string) {
    document.getElementById('toggles').innerHTML = '';
    roundNameElem.innerText = roundName;
    for (let i = 0; i < games.length; i++) {
        const element = games[i];
        addToggle(element, i);
    }
}

document.getElementById('btn-reset').onclick = () => {
    nodecg.sendMessage('setActiveRound', { roundId: activeRound.value.round.id } as SetActiveRoundRequest);
};
