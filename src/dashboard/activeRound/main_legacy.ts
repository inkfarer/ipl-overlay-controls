import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons/faInfoCircle';

import { activeRound } from './replicants';
import { ActiveRoundGame } from 'types/activeRoundGame';
import { addToggle } from './toggleCreator';
import { updateToggles } from './toggleUpdater';

import '../styles/globalStyles_legacy.css';
import './activeRound.css';

import './roundUpdater';
import './teamAndRoundDataSelector';
import '../helpers/buttonConfirm';

library.add(faTimes, faInfoCircle);
dom.watch();

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
    const roundDataSelectors
        = document.querySelectorAll('.mode-selector, .stage-selector') as NodeListOf<HTMLSelectElement>;
    const checked = (e.target as HTMLInputElement).checked;
    const selectorDisplay = checked ? '' : 'none';
    const modeSelectorDisplay = checked ? 'none' : '';
    colorSelectors.forEach(selector => {
        selector.style.display = selectorDisplay;
    });
    roundDataSelectors.forEach(selector => {
        selector.style.display = modeSelectorDisplay;
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

document.getElementById('btn-reset').addEventListener('confirm', () => {
    nodecg.sendMessage('resetActiveRound');
});
