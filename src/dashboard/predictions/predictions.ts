import { hideElement, showElement } from '../globalScripts';
import { PredictionStore } from 'schemas';
import { setImportStatus } from '../importStatus';
import { ImportStatus } from 'types/importStatus';
import { PredictionStatus } from 'types/predictionStatus';
import { Outcome } from 'types/prediction';

const predictionDataStatusElem = document.getElementById('prediction-data-status');
const optionAWrapper = document.getElementById('option-wrapper-a');
const optionBWrapper = document.getElementById('option-wrapper-b');
const predictionStatusElem = document.getElementById('prediction-status');
const predictionPointCountElem = document.getElementById('prediction-point-count');
const predictionTitleElem = document.getElementById('prediction-title');

const unsupportedGuildWarning = document.getElementById('unsupported-service-message');
const currentPredictionSpace = document.getElementById('current-prediction-space');
const predictionGetSpace = document.getElementById('prediction-get-space');

const createPredictionBtn = document.getElementById('create-prediction-btn');
const resolvePredictionBtn = document.getElementById('resolve-prediction-btn');
const lockPredictionBtn = document.getElementById('lock-prediction-btn');
const cancelPredictionBtn = document.getElementById('cancel-prediction-btn');
const getPredictionsBtn = document.getElementById('get-predictions-btn');

const predictionStore = nodecg.Replicant<PredictionStore>('predictionStore');

const predictionButtons = [lockPredictionBtn, cancelPredictionBtn, resolvePredictionBtn, createPredictionBtn];
const visibleButtonsForPredictionStatus: { [key in PredictionStatus]: HTMLElement[] } = {
    [PredictionStatus.ACTIVE]: [lockPredictionBtn, cancelPredictionBtn],
    [PredictionStatus.LOCKED]: [resolvePredictionBtn, cancelPredictionBtn],
    [PredictionStatus.RESOLVED]: [createPredictionBtn],
    [PredictionStatus.CANCELED]: [createPredictionBtn]
};

function getArrayDifference<T>(arr1: T[], arr2: T[]): T[] {
    return arr1.filter(elem => !arr2.includes(elem));
}

predictionStore.on('change', newValue => {
    if (newValue.enablePrediction) {
        hideElement(unsupportedGuildWarning);
        showElement(currentPredictionSpace);
        showElement(predictionGetSpace);
        // Display info on current prediction
        if (newValue.currentPrediction) {
            const prediction = newValue.currentPrediction;
            const totalChannelPoints = prediction.outcomes[0].channel_points + prediction.outcomes[1].channel_points;

            updatePredictionDataDisplay(
                optionAWrapper,
                (prediction.outcomes[0] as Outcome),
                totalChannelPoints,
                prediction.winning_outcome_id);
            updatePredictionDataDisplay(
                optionBWrapper,
                (prediction.outcomes[1] as Outcome),
                totalChannelPoints,
                prediction.winning_outcome_id);

            predictionStatusElem.innerText = prediction.status.toLowerCase();
            predictionPointCountElem.innerText = `${totalChannelPoints} points predicted`;
            predictionTitleElem.innerText = prediction.title;

            // Show/Hide necessary buttons
            const visibleButtons =
                visibleButtonsForPredictionStatus[prediction.status as PredictionStatus];
            const hiddenButtons = getArrayDifference(predictionButtons, visibleButtons);
            hiddenButtons.forEach(btn => hideElement(btn));
            visibleButtons.forEach(btn => showElement(btn));
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
    winningOutcomeId: string): void {
    const optionDataWrapper = optionWrapper.querySelector('.option-data-wrapper');
    const titleElem = optionDataWrapper.querySelector('.option-title') as HTMLDivElement;
    const percentTextElem = optionDataWrapper.querySelector('.percent') as HTMLSpanElement;
    const barElem = optionDataWrapper.querySelector('.bar') as HTMLDivElement;
    const label = optionWrapper.querySelector('label');

    const optionPercentage = Math.round((outcome.channel_points / totalPointsPredicted) * 100);

    titleElem.innerText = outcome.title;
    percentTextElem.innerText = (isNaN(optionPercentage) ? '?%' : `${optionPercentage}%`);
    barElem.style.width = (isNaN(optionPercentage) ? '0%' : `${optionPercentage}%`);
    optionWrapper.dataset.outcomeId = outcome.id;

    const option = label.innerText.charAt(label.innerText.length - 1);
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

getPredictionsBtn.onclick = () => {
    setImportStatus(ImportStatus.Loading, predictionDataStatusElem);
    nodecg.sendMessage('getPredictions', {}, (e) => {
        if (e) {
            console.error(e);
            setImportStatus(ImportStatus.Failure, predictionDataStatusElem);
            return;
        }
        setImportStatus(ImportStatus.Success, predictionDataStatusElem);
    });
};
