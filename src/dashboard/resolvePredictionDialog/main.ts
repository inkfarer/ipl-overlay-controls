import '../styles/globalStyles.scss';
import '../styles/dialogStyles.scss';
import { setUpReplicants } from '../helpers/storeHelper';
import Panel from './resolvePredictionDialog.vue';
import { createApp } from 'vue';
import { predictionDataStore, predictionDataStoreKey, predictionReps } from '../store/predictionDataStore';
import { activeRoundReps, activeRoundStore, activeRoundStoreKey } from '../store/activeRoundStore';

(async () => {
    await setUpReplicants(predictionReps, predictionDataStore);
    await setUpReplicants(activeRoundReps, activeRoundStore);

    const app = createApp(Panel);
    app.use(predictionDataStore, predictionDataStoreKey);
    app.use(activeRoundStore, activeRoundStoreKey);
    app.mount('#app');
})();
