import { addChangeReminder, addDots, addSelector, clearSelectors, hideElement, showElement } from '../globalScripts';
import { setImportStatus } from '../importStatus';
import { ImportStatus } from 'types/importStatus';
import { FieldValidity } from './types/fieldValidity';

const fieldValidity: FieldValidity = {};

const predictionCreateStatusElem = document.getElementById('prediction-create-status');

const predictionNameLabel = document.getElementById('prediction-name-label');
const predictionNameInput = document.getElementById('prediction-name-input');
const optionALabel = document.getElementById('prediction-option-a-label');
const optionAInput = document.getElementById('prediction-option-a-input');
const optionBLabel = document.getElementById('prediction-option-b-label');
const optionBInput = document.getElementById('prediction-option-b-input');
const predictionWindowInput = document.getElementById('prediction-window-input') as HTMLInputElement;

const messageElem = document.getElementById('message');
const warningElem = document.getElementById('warning-message');

const createPredictionBtn = document.getElementById('create-predictions-btn') as HTMLButtonElement;

/**
 * Does checks if the button should be enabled or disabled
 */
function checkButtonValidity(){
    const predictionWindow = parseInt(predictionWindowInput.value);
    console.log(predictionWindow);
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
function addInputLengthLimit(input: HTMLElement, label: HTMLElement, name: string, fieldLimit: number, ){
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

// createPredictionBtn.onclick = () => {
//     setImportStatus(ImportStatus.Loading, predictionCreateStatusElem);
//
// };

addInputLengthLimit(predictionNameInput, predictionNameLabel, 'Name of Prediction', 45);
addInputLengthLimit(optionAInput, optionALabel, 'Option A', 25);
addInputLengthLimit(optionBInput, optionBLabel, 'Option B', 25);