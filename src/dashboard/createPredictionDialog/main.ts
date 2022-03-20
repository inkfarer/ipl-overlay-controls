import '../styles/globalStyles.scss';
import '../styles/dialogStyles.scss';
import { setUpPiniaReplicants } from '../helpers/storeHelper';
import Panel from './createPredictionDialog.vue';
import { createApp } from 'vue';
import { predictionReps, usePredictionDataStore } from '../store/predictionDataStore';
import { nextRoundReps, useNextRoundStore } from '../store/nextRoundStore';
import { setUpErrorHandler } from '../store/errorHandlerStore';
import { createPinia } from 'pinia';

(async () => {
    const app = createApp(Panel);

    app.use(createPinia());
    await setUpPiniaReplicants(nextRoundReps, useNextRoundStore());
    await setUpPiniaReplicants(predictionReps, usePredictionDataStore());
    setUpErrorHandler(app);
    app.mount('#app');
})();
