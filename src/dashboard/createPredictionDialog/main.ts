import '../styles/globalStyles.scss';
import '../styles/dialogStyles.scss';
import { setUpReplicants } from '../helpers/storeHelper';
import Panel from './createPredictionDialog.vue';
import { createApp } from 'vue';
import { predictionDataStore, predictionDataStoreKey, predictionReps } from '../store/predictionDataStore';
import { nextRoundReps, nextRoundStore, nextRoundStoreKey } from '../store/nextRoundStore';

(async () => {
    await setUpReplicants(predictionReps, predictionDataStore);
    await setUpReplicants(nextRoundReps, nextRoundStore);

    const app = createApp(Panel);
    app.use(predictionDataStore, predictionDataStoreKey);
    app.use(nextRoundStore, nextRoundStoreKey);
    app.mount('#app');
})();
