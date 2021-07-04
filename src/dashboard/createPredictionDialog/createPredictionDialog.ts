import { hideElement, showElement } from '../globalScripts';
import { setImportStatus } from '../importStatus';
import { ImportStatus } from 'types/importStatus';
import { FieldValidity } from './types/fieldValidity';
import { NextTeams } from 'schemas';

const fieldValidity: FieldValidity = {};

const nextTeams = nodecg.Replicant<NextTeams>('nextTeams');
const predictionCreateStatusElem = document.getElementById('prediction-create-status');

const predictionNameLabel = document.getElementById('prediction-name-label');
const predictionNameInput = document.getElementById('prediction-name-input') as HTMLInputElement;
const optionALabel = document.getElementById('prediction-option-a-label');
const optionAInput = document.getElementById('prediction-option-a-input') as HTMLInputElement;
const optionBLabel = document.getElementById('prediction-option-b-label');
const optionBInput = document.getElementById('prediction-option-b-input') as HTMLInputElement;
const predictionWindowInput = document.getElementById('prediction-window-input') as HTMLInputElement;

const messageElem = document.getElementById('message');
const warningElem = document.getElementById('warning-message');

const createPredictionBtn = document.getElementById('create-predictions-btn') as HTMLButtonElement;

/**
 * Does checks if the button should be enabled or disabled
 */
function checkButtonValidity(){
    const predictionWindow = parseInt(predictionWindowInput.value);
    if (Object.values(fieldValidity).includes(false)) {
        messageElem.innerText = 'Field(s) are too long!';
        showElement(warningElem);
        createPredictionBtn.disabled = true;
    }else if(predictionWindow < 1 || predictionWindow > 1800 || isNaN(predictionWindow)) {
        messageElem.innerText = 'Prediction Window must be between 1-1800';
        showElement(warningElem);
        createPredictionBtn.disabled = true;
    } else {
        messageElem.innerText = '';
        hideElement(warningElem);
        createPredictionBtn.disabled = false;
    }
}

/**
 * Add change listen to text field
 * @param input Input Element
 * @param label Label Element
 * @param name The name of the Label
 * @param fieldLimit Field limit for input
 */
function addInputLengthLimit(input: HTMLInputElement, label: HTMLElement, name: string, fieldLimit: number){
    input.addEventListener('input', function (event) {
        const target = event.target as HTMLInputElement;
        label.innerText = `${name} (${target.value.length}/${fieldLimit})`;
        if (target.value.length > fieldLimit || target.value.length < 1) {
            // if too long we turn txt red and add a false flag to the object
            input.style.color = 'red';
            fieldValidity[name] = false;
        }else{
            input.style.color = 'white';
            fieldValidity[name] = true;
        }
        checkButtonValidity();
    });
}

/**
 * Set value for input field
 * @param input Input Element
 * @param label Label Element
 * @param name The name of the Label
 * @param fieldLimit Field limit for input
 * @param value Value to set
 */
function setInputField(input: HTMLInputElement, label: HTMLElement, name: string, fieldLimit: number, value: string){
    input.value = value;
    label.innerText = `${name} (${value.length}/${fieldLimit})`;
    if (value.length > fieldLimit || value.length < 1) {
        // if too long we turn txt red and add a false flag to the object
        input.style.color = 'red';
        fieldValidity[name] = false;
    }else{
        input.style.color = 'white';
        fieldValidity[name] = true;
    }
    checkButtonValidity();
}

// Checks if the prediction window is valid
predictionWindowInput.addEventListener('input', function (event) {
    const target = event.target as HTMLInputElement;
    const predictionWindow = parseInt(target.value);
    if(predictionWindow < 1 || predictionWindow > 1800 || isNaN(predictionWindow)){
        predictionWindowInput.style.color = 'red';
    }else{
        predictionWindowInput.style.color = 'white';
    }
    checkButtonValidity();
});

createPredictionBtn.onclick = () => {
    setImportStatus(ImportStatus.Loading, predictionCreateStatusElem);
    nodecg.sendMessage('postPrediction', {
        title: predictionNameInput.value,
        outcomes: [
            { title: optionAInput.value },
            { title: optionBInput.value }
        ],
        prediction_window: predictionWindowInput.value
    }, (e) => {
        if(e){
            console.error(e);
            setImportStatus(ImportStatus.Failure, predictionCreateStatusElem);
            messageElem.innerText = e.detail.message;
            showElement(warningElem);
            return;
        }
        setImportStatus(ImportStatus.Success, predictionCreateStatusElem);
    });
};

// Set team names
nextTeams.on('change', newValue => {
    setInputField(optionAInput, optionALabel, 'Option A', 25, newValue.teamAInfo.name);
    setInputField(optionBInput, optionBLabel, 'Option B', 25, newValue.teamBInfo.name);
});

addInputLengthLimit(predictionNameInput, predictionNameLabel, 'Name of Prediction', 45);
addInputLengthLimit(optionAInput, optionALabel, 'Option A', 25);
addInputLengthLimit(optionBInput, optionBLabel, 'Option B', 25);