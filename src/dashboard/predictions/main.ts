import '../styles/globalStyles.scss';
import { setUpReplicants } from '../helpers/storeHelper';
import Panel from './predictions.vue';
import { createApp } from 'vue';
import { predictionDataStore, predictionDataStoreKey, predictionReps } from '../store/predictionDataStore';
import { setUpErrorHandler } from '../store/errorHandlerStore';
import { createPinia } from 'pinia';

setUpReplicants(predictionReps, predictionDataStore).then(() => {
    const app = createApp(Panel);
    app.use(createPinia());
    setUpErrorHandler(app);
    app.use(predictionDataStore, predictionDataStoreKey);
    app.mount('#app');
});
