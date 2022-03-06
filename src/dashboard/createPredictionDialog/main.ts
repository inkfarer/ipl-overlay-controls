import '../styles/globalStyles.scss';
import '../styles/dialogStyles.scss';
import { setUpPiniaReplicants, setUpReplicants } from '../helpers/storeHelper';
import Panel from './createPredictionDialog.vue';
import { createApp } from 'vue';
import { predictionDataStore, predictionDataStoreKey, predictionReps } from '../store/predictionDataStore';
import { nextRoundReps, useNextRoundStore } from '../store/nextRoundStore';
import { setUpErrorHandler } from '../store/errorHandlerStore';
import { createPinia } from 'pinia';

(async () => {
    await setUpReplicants(predictionReps, predictionDataStore);

    const app = createApp(Panel);
    app.use(createPinia());
    await setUpPiniaReplicants(nextRoundReps, useNextRoundStore());
    setUpErrorHandler(app);
    app.use(predictionDataStore, predictionDataStoreKey);
    app.mount('#app');
})();
