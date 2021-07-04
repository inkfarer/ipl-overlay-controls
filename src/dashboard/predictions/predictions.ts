import { addChangeReminder, addDots, addSelector, clearSelectors, hideElement, showElement } from '../globalScripts';
import { PredictionStore } from 'schemas';

const optionABarElem = document.getElementById('option-a-bar');
const optionBBarElem = document.getElementById('option-b-bar');
const optionATitleElem = document.getElementById('option-a-title');
const optionBTitleElem = document.getElementById('option-b-title');
const optionAPercentageElem = document.getElementById('option-a-percent');
const optionBPercentageElem = document.getElementById('option-b-percent');
const predictionStatusElem = document.getElementById('prediction-status');

const unsupportedGuildWarning = document.getElementById('unsupported-service-message');
const currentPredictionSpace = document.getElementById('current-prediction-space');
const predictionOptionsSpace = document.getElementById('prediction-options-space');

const predictionStore = nodecg.Replicant<PredictionStore>('predictionStore');

predictionStore.on('change', newValue => {
    if(newValue.enablePrediction){
        hideElement(unsupportedGuildWarning);
        showElement(currentPredictionSpace);
        showElement(predictionOptionsSpace);
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
        hideElement(predictionOptionsSpace);
    }
});