import { hideElement, showElement } from '../helpers/elemHelper';
import { setImportStatus } from '../helpers/importStatusHelper';
import { ImportStatus } from 'types/enums/importStatus';
import { PredictionStatus } from 'types/enums/predictionStatus';
import { predictionStore } from './replicants';
import difference from 'lodash/difference';
import { Outcome } from 'schemas';
import { pluralize } from '../helpers/stringHelper';

const predictionDataStatusElem = document.getElementById('prediction-data-status');
const optionAWrapper = document.getElementById('option-wrapper-a');
const optionBWrapper = document.getElementById('option-wrapper-b');
const getPredictionStatusElem = document.getElementById('get-prediction-status');
const predictionPointCountElem = document.getElementById('prediction-point-count');
const predictionTitleElem = document.getElementById('prediction-title');

const noPredictionDataMessage = document.getElementById('no-prediction-message');
const unsupportedGuildWarning = document.getElementById('unsupported-service-message');
const currentPredictionSpace = document.getElementById('current-prediction-space');
const predictionGetSpace = document.getElementById('prediction-get-space');

const createPredictionBtn = document.getElementById('create-prediction-btn');
const resolvePredictionBtn = document.getElementById('resolve-prediction-btn');
const lockPredictionBtn = document.getElementById('lock-prediction-btn');
const cancelPredictionBtn = document.getElementById('cancel-prediction-btn');
const getPredictionsBtn = document.getElementById('get-predictions-btn');
const predictionRequestStatusElem = document.getElementById('prediction-request-status');

const predictionElements = [
    lockPredictionBtn,
    cancelPredictionBtn,
    resolvePredictionBtn,
    createPredictionBtn,
    predictionRequestStatusElem];

const visibleElementsForPredictionStatus: { [key in PredictionStatus]: HTMLElement[] } = {
    [PredictionStatus.ACTIVE]: [lockPredictionBtn, cancelPredictionBtn, predictionRequestStatusElem],
    [PredictionStatus.LOCKED]: [resolvePredictionBtn, cancelPredictionBtn, predictionRequestStatusElem],
    [PredictionStatus.RESOLVED]: [createPredictionBtn],
    [PredictionStatus.CANCELED]: [createPredictionBtn]
};

predictionStore.on('change', newValue => {
    if (newValue.enablePrediction) {
        hideElement(unsupportedGuildWarning);
        showElement(predictionGetSpace);
        // Display info on current prediction
        if (newValue.currentPrediction) {
            showElement(currentPredictionSpace);
            hideElement(noPredictionDataMessage);
            const prediction = newValue.currentPrediction;
            const totalChannelPoints = prediction.outcomes[0].pointsUsed + prediction.outcomes[1].pointsUsed;
            const totalPredictors = prediction.outcomes[0].users + prediction.outcomes[1].users;

            updatePredictionDataDisplay(
                optionAWrapper,
                prediction.outcomes[0],
                totalChannelPoints,
                prediction.winningOutcome,
                'A');
            updatePredictionDataDisplay(
                optionBWrapper,
                prediction.outcomes[1],
                totalChannelPoints,
                prediction.winningOutcome,
                'B');

            getPredictionStatusElem.innerText = prediction.status.toLowerCase();
            predictionPointCountElem.innerText = `${totalChannelPoints} points predicted by ${pluralize('user', totalPredictors)}`;
            predictionTitleElem.innerText = prediction.title;

            // Show/Hide necessary buttons
            const visibleButtons = visibleElementsForPredictionStatus[prediction.status as PredictionStatus];
            const hiddenButtons = difference(predictionElements, visibleButtons);
            hiddenButtons.forEach(btn => hideElement(btn));
            visibleButtons.forEach(btn => showElement(btn));
        } else {
            hideElement(currentPredictionSpace);
            showElement(noPredictionDataMessage);
        }

        if (newValue.socketOpen) {
            hideElement(predictionGetSpace);
        } else {
            showElement(predictionGetSpace);
        }
    } else {
        showElement(unsupportedGuildWarning);
        hideElement(currentPredictionSpace);
        hideElement(predictionGetSpace);
    }
});

function updatePredictionDataDisplay(
    optionWrapper: HTMLElement,
    outcome: Outcome,
    totalPointsPredicted: number,
    winningOutcomeId: string,
    option: 'A' | 'B'
): void {
    const optionDataWrapper = optionWrapper.querySelector('.option-data-wrapper');
    const titleElem = optionDataWrapper.querySelector('.option-title') as HTMLDivElement;
    const percentTextElem = optionDataWrapper.querySelector('.percent') as HTMLSpanElement;
    const barElem = optionDataWrapper.querySelector('.bar') as HTMLDivElement;
    const label = optionWrapper.querySelector('label');

    const optionPercentage = Math.round((outcome.pointsUsed / totalPointsPredicted) * 100);

    titleElem.innerText = outcome.title;
    percentTextElem.innerText = (isNaN(optionPercentage) ? '?%' : `${optionPercentage}%`);
    barElem.style.width = (isNaN(optionPercentage) ? '0%' : `${optionPercentage}%`);
    optionWrapper.dataset.outcomeId = outcome.id;

    if (winningOutcomeId != null && outcome.id === winningOutcomeId) {
        label.innerText = `Winner - Option ${option}`;
        label.classList.add('winner');
        optionDataWrapper.classList.add('winner');
    } else {
        label.innerText = `Option ${option}`;
        label.classList.remove('winner');
        optionDataWrapper.classList.remove('winner');
    }
}

getPredictionsBtn.addEventListener('click', () => {
    setImportStatus(ImportStatus.LOADING, predictionDataStatusElem);
    nodecg.sendMessage('getPredictions', {}, (e) => {
        if (e) {
            console.error(e);
            setImportStatus(ImportStatus.FAILURE, predictionDataStatusElem);
            return;
        }
        setImportStatus(ImportStatus.SUCCESS, predictionDataStatusElem);
    });
});
