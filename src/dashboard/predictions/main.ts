import '../styles/globalStyles.scss';
import { setUpReplicants } from '../helpers/storeHelper';
import Panel from './predictions.vue';
import { createApp } from 'vue';
import { predictionDataStore, predictionDataStoreKey, predictionReps } from './predictionDataStore';

setUpReplicants(predictionReps, predictionDataStore).then(() => {
    const app = createApp(Panel);
    app.use(predictionDataStore, predictionDataStoreKey);
    app.mount('#app');
});
