import '../../browser/styles/globalStyles.scss';
import { setUpReplicants } from '../helpers/storeHelper';
import { createApp } from 'vue';
import { tournamentDataReps, tournamentDataStore, tournamentDataStoreKey } from '../store/tournamentDataStore';
import DataImport from './dataIO.vue';
import { setUpErrorHandler } from '../store/errorHandlerStore';

setUpReplicants(tournamentDataReps, tournamentDataStore).then(() => {
    const app = createApp(DataImport);
    setUpErrorHandler(app);
    app.use(tournamentDataStore, tournamentDataStoreKey);
    app.mount('#app');
});
