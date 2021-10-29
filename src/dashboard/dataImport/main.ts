import '../styles/globalStyles.scss';
import { setUpReplicants } from '../helpers/storeHelper';
import { createApp } from 'vue';
import { tournamentDataReps, tournamentDataStore, tournamentDataStoreKey } from '../store/tournamentDataStore';
import DataImport from './dataImport.vue';

setUpReplicants(tournamentDataReps, tournamentDataStore).then(() => {
    const app = createApp(DataImport);
    app.use(tournamentDataStore, tournamentDataStoreKey);
    app.mount('#app');
});
