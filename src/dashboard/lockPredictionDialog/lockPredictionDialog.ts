import { hideElement, showElement } from '../globalScripts';
import { setImportStatus } from '../importStatus';
import { ImportStatus } from 'types/importStatus';
import { PredictionStore } from 'schemas';

const predictionStore = nodecg.Replicant<PredictionStore>('predictionStore');

const warningMessageElem = document.getElementById('message-warning');
const infoElem = document.getElementById('info-message-box');

const lockPredictionBtn = document.getElementById('lock-predictions-btn') as HTMLButtonElement;

const predictionPatchStatusElem = document.getElementById('prediction-patch-status');

document.addEventListener('dialog-opened', function() {
    warningMessageElem.innerText = 'Are you sure you want to lock this prediction!';
});

NodeCG.waitForReplicants(predictionStore).then(() => {
    predictionStore.on('change', newValue => {
        if (newValue.currentPrediction.status !== 'ACTIVE') {
            lockPredictionBtn.disabled = true;
            showElement(infoElem);
        } else {
            lockPredictionBtn.disabled = false;
            hideElement(infoElem);
        }
    });
});

lockPredictionBtn.onclick = () => {
    setImportStatus(ImportStatus.Loading, predictionPatchStatusElem);
    nodecg.sendMessage('patchPrediction', {
        id: predictionStore.value.currentPrediction.id,
        status: 'LOCKED',
    }, (e) => {
        if (e) {
            console.error(e);
            setImportStatus(ImportStatus.Failure, predictionPatchStatusElem);
            warningMessageElem.innerText = e.detail.message;
            return;
        }
        setImportStatus(ImportStatus.Success, predictionPatchStatusElem);
    });
};