import '../styles/globalStyles.scss';
import { setUpReplicants } from '../helpers/storeHelper';
import Panel from './predictions.vue';
import { createApp } from 'vue';
import { predictionDataStore, predictionDataStoreKey, predictionReps } from '../store/predictionDataStore';
import { setUpErrorHandler } from '../store/errorHandlerStore';

setUpReplicants(predictionReps, predictionDataStore).then(() => {
    const app = createApp(Panel);
    setUpErrorHandler(app);
    app.use(predictionDataStore, predictionDataStoreKey);
    app.mount('#app');
});
