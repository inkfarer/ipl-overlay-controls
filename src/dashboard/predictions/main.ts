import '../styles/globalStyles.scss';
import { setUpPiniaReplicants } from '../helpers/storeHelper';
import Panel from './predictions.vue';
import { createApp } from 'vue';
import { predictionReps, usePredictionDataStore } from '../store/predictionDataStore';
import { setUpErrorHandler } from '../store/errorHandlerStore';
import { createPinia } from 'pinia';

(async () => {
    const app = createApp(Panel);
    app.use(createPinia());
    await setUpPiniaReplicants(predictionReps, usePredictionDataStore());
    setUpErrorHandler(app);
    app.mount('#app');
})();
