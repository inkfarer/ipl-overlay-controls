import '../styles/globalStyles.scss';
import '../styles/dialogStyles.scss';
import { setUpPiniaReplicants, setUpReplicants } from '../helpers/storeHelper';
import Panel from './resolvePredictionDialog.vue';
import { createApp } from 'vue';
import { predictionDataStore, predictionDataStoreKey, predictionReps } from '../store/predictionDataStore';
import { activeRoundReps, useActiveRoundStore } from '../store/activeRoundStore';
import { setUpErrorHandler } from '../store/errorHandlerStore';
import { createPinia } from 'pinia';

(async () => {
    await setUpReplicants(predictionReps, predictionDataStore);

    const app = createApp(Panel);
    app.use(createPinia());
    await setUpPiniaReplicants(activeRoundReps, useActiveRoundStore());
    setUpErrorHandler(app);
    app.use(predictionDataStore, predictionDataStoreKey);
    app.mount('#app');
})();
