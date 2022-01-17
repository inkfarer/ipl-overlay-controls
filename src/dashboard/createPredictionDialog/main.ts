import '../styles/globalStyles.scss';
import '../styles/dialogStyles.scss';
import { setUpReplicants } from '../helpers/storeHelper';
import Panel from './createPredictionDialog.vue';
import { createApp } from 'vue';
import { predictionDataStore, predictionDataStoreKey, predictionReps } from '../store/predictionDataStore';
import { nextRoundReps, nextRoundStore, nextRoundStoreKey } from '../store/nextRoundStore';
import { setUpErrorHandler } from '../store/errorHandlerStore';

(async () => {
    await setUpReplicants(predictionReps, predictionDataStore);
    await setUpReplicants(nextRoundReps, nextRoundStore);

    const app = createApp(Panel);
    setUpErrorHandler(app);
    app.use(predictionDataStore, predictionDataStoreKey);
    app.use(nextRoundStore, nextRoundStoreKey);
    app.mount('#app');
})();
