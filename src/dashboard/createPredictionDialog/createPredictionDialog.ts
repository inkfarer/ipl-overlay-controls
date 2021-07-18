import { addDots, hideElement, showElement } from '../globalScripts';
import { setImportStatus } from '../importStatus';
import { ImportStatus } from 'types/importStatus';
import { FieldValidity } from './types/fieldValidity';
import { NextRound } from 'schemas';

const fieldValidity: FieldValidity = {};

const nextRound = nodecg.Replicant<NextRound>('nextRound');
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
function checkButtonValidity() {
    const predictionWindow = parseInt(predictionWindowInput.value);
    if (Object.values(fieldValidity).includes(false)) {
        messageElem.innerText = 'Field(s) are invalid!';
        showElement(warningElem);
        createPredictionBtn.disabled = true;
    } else if (predictionWindow < 1 || predictionWindow > 1800 || isNaN(predictionWindow)) {
        messageElem.innerText = 'Prediction Window must be between 1 - 1800 seconds';
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
function addInputLengthLimit(input: HTMLInputElement, label: HTMLElement, name: string, fieldLimit: number) {
    validateFieldLength(input, label, name, fieldLimit);

    input.addEventListener('input', (event) => {
        const target = event.target as HTMLInputElement;
        validateFieldLength(target, label, name, fieldLimit);
    });
}

/**
 * Set value for input field
 * @param input Input Element
 * @param value Value to set
 */
function setInputField(input: HTMLInputElement, value: string) {
    input.value = value;
    input.dispatchEvent(new Event('input'));
}

function validateFieldLength(input: HTMLInputElement, label: HTMLElement, name: string, fieldLimit: number) {
    label.innerText = `${name} (${input.value.length}/${fieldLimit})`;
    if (input.value.length > fieldLimit || input.value.length < 1) {
        input.style.color = 'red';
        label.style.color = 'red';
        fieldValidity[name] = false;
    } else {
        input.style.color = '';
        label.style.color = '';
        fieldValidity[name] = true;
    }
    checkButtonValidity();
}

// Checks if the prediction window is valid
predictionWindowInput.addEventListener('input', function (event) {
    const target = event.target as HTMLInputElement;
    const predictionWindow = parseInt(target.value);
    if (predictionWindow < 1 || predictionWindow > 1800 || isNaN(predictionWindow)) {
        predictionWindowInput.style.color = 'red';
    } else {
        predictionWindowInput.style.color = 'white';
    }
    checkButtonValidity();
});

createPredictionBtn.onclick = () => {
    setImportStatus(ImportStatus.LOADING, predictionCreateStatusElem);
    nodecg.sendMessage('postPrediction', {
        title: predictionNameInput.value,
        outcomes: [
            { title: optionAInput.value },
            { title: optionBInput.value }
        ],
        prediction_window: predictionWindowInput.value
    }, (e) => {
        if (e) {
            console.error(e);
            setImportStatus(ImportStatus.FAILURE, predictionCreateStatusElem);
            messageElem.innerText = e.message;
            showElement(warningElem);
            return;
        }
        setImportStatus(ImportStatus.SUCCESS, predictionCreateStatusElem);
    });
};

// Set team names
nextRound.on('change', newValue => {
    setInputField(optionAInput, addDots(newValue.teamA.name, 25));
    setInputField(optionBInput, addDots(newValue.teamB.name, 25));
});

addInputLengthLimit(predictionNameInput, predictionNameLabel, 'Name of Prediction', 45);
addInputLengthLimit(optionAInput, optionALabel, 'Option A', 25);
addInputLengthLimit(optionBInput, optionBLabel, 'Option B', 25);
