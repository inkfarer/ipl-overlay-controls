import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons/faExclamationTriangle';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons/faInfoCircle';
import { hideMessage, showMessage } from '../helpers/messageHelper';
import { appendElementAfter } from '../helpers/elemHelper';
import { elementById } from '../helpers/elemHelper';
import { autoResolveWinner, resolvePrediction, setUI } from './resolvePredictionDialog';
import {
    activeRound, autoResolveBtn, predictionStore, resolveOptionABtn, resolveOptionBBtn, winningOption
} from './elements';

library.add(faExclamationTriangle, faInfoCircle);
dom.watch();

import '../styles/globalStyles_legacy.css';
import '../styles/statusDisplay.css';
import './resolvePredictionDialog.css';

NodeCG.waitForReplicants(predictionStore, activeRound).then(() => {
    predictionStore.on('change', newValue => {
        autoResolveWinner(activeRound.value, newValue);
        setUI(newValue);
    });

    activeRound.on('change', newValue => {
        autoResolveWinner(newValue, predictionStore.value);
        setUI(predictionStore.value);
        if (!newValue.round.isCompleted) {
            showMessage(
                'round-completed-warning',
                'warning',
                'The active round has not yet completed!',
                (elem) => appendElementAfter(elem, elementById('resolve-space-title')));
        } else {
            hideMessage('round-completed-warning');
        }
    });
});

// Assign onclick functions to buttons
autoResolveBtn.addEventListener('click', () => resolvePrediction(winningOption.optionIndex));
resolveOptionABtn.addEventListener('click', () => resolvePrediction(0));
resolveOptionBBtn.addEventListener('click', () => resolvePrediction(1));
