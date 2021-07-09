import { setImportStatus } from '../importStatus';
import { ImportStatus } from 'types/importStatus';
import { predictionStore } from './replicants';
import { PredictionStatus } from 'types/predictionStatus';

const predictionRequestStatusElem = document.getElementById('prediction-request-status');

document.getElementById('lock-prediction-btn').addEventListener('confirm', () => {
    if (!predictionStore.value.currentPrediction
        || [PredictionStatus.LOCKED, PredictionStatus.CANCELED, PredictionStatus.RESOLVED]
            .includes(predictionStore.value.currentPrediction.status as PredictionStatus)
    ) {
        nodecg.log.info('Cannot lock prediction at this time.');
        return;
    }

    setImportStatus(ImportStatus.Loading, predictionRequestStatusElem);
    nodecg.sendMessage('patchPrediction', {
        id: predictionStore.value.currentPrediction.id,
        status: 'LOCKED',
    }, (e) => {
        if (e) {
            console.error(e);
            setImportStatus(ImportStatus.Failure, predictionRequestStatusElem);
            return;
        }
        setImportStatus(ImportStatus.Success, predictionRequestStatusElem);
    });
});
