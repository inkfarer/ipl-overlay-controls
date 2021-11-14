import '../styles/globalStyles.scss';
import { setUpReplicants } from '../helpers/storeHelper';
import Panel from './rounds.vue';
import { createApp } from 'vue';
import { tournamentDataReps, tournamentDataStore, tournamentDataStoreKey } from '../store/tournamentDataStore';

setUpReplicants(tournamentDataReps, tournamentDataStore).then(() => {
    const app = createApp(Panel);
    app.use(tournamentDataStore, tournamentDataStoreKey);
    app.mount('#app');
});
