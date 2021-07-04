import { addDots, hideElement, showElement } from '../globalScripts';
import { PredictionStore } from 'schemas';
import { setImportStatus } from '../importStatus';
import { ImportStatus } from 'types/importStatus';

const predictionDataStatusElem = document.getElementById('prediction-data-status');
const optionABarElem = document.getElementById('option-a-bar');
const optionBBarElem = document.getElementById('option-b-bar');
const optionATitleElem = document.getElementById('option-a-title');
const optionBTitleElem = document.getElementById('option-b-title');
const optionAPercentageElem = document.getElementById('option-a-percent');
const optionBPercentageElem = document.getElementById('option-b-percent');
const predictionStatusElem = document.getElementById('prediction-status');

const unsupportedGuildWarning = document.getElementById('unsupported-service-message');
const currentPredictionSpace = document.getElementById('current-prediction-space');
const predictionGetSpace = document.getElementById('prediction-get-space');

const getPredictionsBtn = document.getElementById('get-predictions-btn');

const predictionStore = nodecg.Replicant<PredictionStore>('predictionStore');

predictionStore.on('change', newValue => {
    if(newValue.enablePrediction){
        hideElement(unsupportedGuildWarning);
        showElement(currentPredictionSpace);
        showElement(predictionGetSpace);
        // Display info on current prediction
        if(newValue.currentPrediction){
            const prediction = newValue.currentPrediction;
            const totalChannelPoints = prediction.outcomes[0].channel_points + prediction.outcomes[1].channel_points;
            const optionAPercentage = Math.round((prediction.outcomes[0].channel_points / totalChannelPoints) * 100);
            const optionBPercentage = Math.round((prediction.outcomes[1].channel_points / totalChannelPoints) * 100);
            // Set bar width
            optionABarElem.style.width = `${optionAPercentage}%`;
            optionBBarElem.style.width = `${optionBPercentage}%`;
            // Set text
            optionATitleElem.innerText = prediction.outcomes[0].title;
            optionBTitleElem.innerText = prediction.outcomes[1].title;
            optionAPercentageElem.innerText = `${optionAPercentage}%`;
            optionBPercentageElem.innerText = `${optionBPercentage}%`;
            predictionStatusElem.innerText = prediction.status.toLowerCase();
        }
    }else{
        showElement(unsupportedGuildWarning);
        hideElement(currentPredictionSpace);
        hideElement(predictionGetSpace);
    }
});

getPredictionsBtn.onclick = () => {
    setImportStatus(ImportStatus.Loading, predictionDataStatusElem);
    nodecg.sendMessage('getPredictions', {}, (e) => {
        // If we get an error
        if (e) {
            console.error(e);
            setImportStatus(ImportStatus.Failure, predictionDataStatusElem);
            return;
        }
        // If we get success
        setImportStatus(ImportStatus.Success, predictionDataStatusElem);
    });
};
