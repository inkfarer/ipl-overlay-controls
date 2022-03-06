import '../styles/globalStyles.scss';
import '../styles/dialogStyles.scss';
import { setUpPiniaReplicants } from '../helpers/storeHelper';
import Panel from './resolvePredictionDialog.vue';
import { createApp } from 'vue';
import { predictionReps, usePredictionDataStore } from '../store/predictionDataStore';
import { activeRoundReps, useActiveRoundStore } from '../store/activeRoundStore';
import { setUpErrorHandler } from '../store/errorHandlerStore';
import { createPinia } from 'pinia';

(async () => {
    const app = createApp(Panel);

    app.use(createPinia());
    await setUpPiniaReplicants(activeRoundReps, useActiveRoundStore());
    await setUpPiniaReplicants(predictionReps, usePredictionDataStore());
    setUpErrorHandler(app);
    app.mount('#app');
})();
