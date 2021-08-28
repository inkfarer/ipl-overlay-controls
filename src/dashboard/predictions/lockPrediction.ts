import { setImportStatus } from '../importStatus';
import { ImportStatus } from 'types/enums/importStatus';
import { predictionStore } from './replicants';
import { PredictionStatus } from 'types/enums/predictionStatus';

const predictionRequestStatusElem = document.getElementById('prediction-request-status');

document.getElementById('lock-prediction-btn').addEventListener('confirm', () => {
    if (!predictionStore.value.currentPrediction
        || [PredictionStatus.LOCKED, PredictionStatus.CANCELED, PredictionStatus.RESOLVED]
            .includes(predictionStore.value.currentPrediction.status as PredictionStatus)
    ) {
        nodecg.log.info('Cannot lock prediction at this time.');
        return;
    }

    setImportStatus(ImportStatus.LOADING, predictionRequestStatusElem);
    nodecg.sendMessage('patchPrediction', {
        id: predictionStore.value.currentPrediction.id,
        status: PredictionStatus.LOCKED,
    }, (e) => {
        if (e) {
            console.error(e);
            setImportStatus(ImportStatus.FAILURE, predictionRequestStatusElem);
            return;
        }
        setImportStatus(ImportStatus.SUCCESS, predictionRequestStatusElem);
    });
});
