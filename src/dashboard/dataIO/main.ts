import '../styles/globalStyles.scss';
import { setUpReplicants } from '../helpers/storeHelper';
import { createApp } from 'vue';
import { tournamentDataReps, tournamentDataStore, tournamentDataStoreKey } from '../store/tournamentDataStore';
import DataImport from './dataIO.vue';
import { setUpErrorHandler } from '../store/errorHandlerStore';
import { createPinia } from 'pinia';

setUpReplicants(tournamentDataReps, tournamentDataStore).then(() => {
    const app = createApp(DataImport);
    app.use(createPinia());
    setUpErrorHandler(app);
    app.use(tournamentDataStore, tournamentDataStoreKey);
    app.mount('#app');
});
