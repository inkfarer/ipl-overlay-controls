import { hideElement, showElement } from '../helpers/elemHelper';
import { setImportStatus } from '../helpers/importStatusHelper';
import { ImportStatus } from 'types/enums/importStatus';
import { ActiveRound, PredictionStore } from 'schemas';
import { autoResolveBtn, predictionStore, resolveOptionABtn, resolveOptionBBtn, winningOption } from './elements';

const warningMessageElem = document.getElementById('message-warning');
const warningElem = document.getElementById('warning-message-box');

const infoMessageElem = document.getElementById('message-info');
const infoElem = document.getElementById('info-message-box');

const predictionPatchStatusElem = document.getElementById('prediction-patch-status');

/**
 * Set disabled param of all buttons
 * @param disabled
 */
export function setBtnDisable(disabled: boolean): void {
    autoResolveBtn.disabled = disabled;
    resolveOptionABtn.disabled = disabled;
    resolveOptionBBtn.disabled = disabled;
}

/**
 * Sets the button UI
 * @param predictionValue value of predictionStore
 */
export function setUI(predictionValue: PredictionStore): void {
    setBtnDisable(false);
    hideElement(warningElem);
    hideElement(infoElem);
    // If auto resolve data is available
    if (winningOption.validOption) {
        autoResolveBtn.innerText = `Auto Resolve: ${winningOption.optionTitle}`;
        autoResolveBtn.disabled = false;
        hideElement(infoElem);
    } else {
        autoResolveBtn.innerText = 'Auto Resolve: ?';
        autoResolveBtn.disabled = true;
        showElement(infoElem);
        infoMessageElem.innerText = 'Unable to determine winning team automatically';
    }
    // Set manual resolve field text
    resolveOptionABtn.innerText = predictionValue.currentPrediction?.outcomes[0].title || 'unknown';
    resolveOptionBBtn.innerText = predictionValue.currentPrediction?.outcomes[1].title || 'unknown';
    // lock buttons if status is not LOCKED
    if (!predictionValue.currentPrediction || predictionValue.currentPrediction.status !== 'LOCKED') {
        showElement(infoElem);
        infoMessageElem.innerText = 'This prediction cannot be resolved right now';
        setBtnDisable(true);
    }
}

/**
 * Attempt to work out which team is winning and if there's a prediction option to resolve in ether's favour
 */
export function autoResolveWinner(activeRound: ActiveRound, predictionValue: PredictionStore): void {
    winningOption.validOption = false;
    if (!predictionValue.currentPrediction) {
        return setUI(predictionValue);
    }

    let winningTeamName: string;
    // Work out which team has higher score
    if (activeRound.teamA.score > activeRound.teamB.score) {
        winningTeamName = activeRound.teamA.name;
    } else if (activeRound.teamB.score > activeRound.teamA.score) {
        winningTeamName = activeRound.teamB.name;
    } else {  // if neither team is in the lead
        setUI(predictionValue);
        return;
    }
    for (let i = 0; i < 2; i++) {  // for each possible outcome
        // If the name of the winning team matches one of the teams in the outcomes' titles
        if (winningTeamName.toUpperCase() === predictionValue.currentPrediction.outcomes[i].title.toUpperCase()) {
            winningOption.optionTitle = predictionValue.currentPrediction.outcomes[i].title;
            winningOption.optionIndex = i;
            winningOption.validOption = true;
            setUI(predictionValue);
            return;
        }
    }
}

/**
 * Run prediction resolve
 * @param index index of winning outcome
 */
export function resolvePrediction(index: number): void {
    if (!predictionStore.value.currentPrediction?.id || index > 1 || index < 0) {
        // if no id (aka no prediction) don't event attempt to patch prediction
        setImportStatus(ImportStatus.FAILURE, predictionPatchStatusElem);
        warningMessageElem.innerText = 'No outcomes/prediction to resolve >.<';
        showElement(warningElem);
        return;
    }
    hideElement(warningElem);  // Hide an errors if we're showing any
    setImportStatus(ImportStatus.LOADING, predictionPatchStatusElem);
    nodecg.sendMessage('patchPrediction', {
        id: predictionStore.value.currentPrediction.id,
        status: 'RESOLVED',
        winning_outcome_id: predictionStore.value.currentPrediction.outcomes[index].id
    }, (e) => {
        if (e) {
            console.error(e);
            setImportStatus(ImportStatus.FAILURE, predictionPatchStatusElem);
            warningMessageElem.innerText = e.message;
            showElement(warningElem);
            return;
        }
        setImportStatus(ImportStatus.SUCCESS, predictionPatchStatusElem);
    });
}
