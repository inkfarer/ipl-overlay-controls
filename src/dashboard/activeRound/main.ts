import '../styles/globalStyles.scss';
import { setUpReplicants } from '../helpers/storeHelper';
import Panel from './activeRound.vue';
import { createApp } from 'vue';
import { tournamentDataReps, tournamentDataStore, tournamentDataStoreKey } from '../store/tournamentDataStore';
import { activeRoundReps, activeRoundStore, activeRoundStoreKey } from './activeRoundStore';

(async () => {
    await setUpReplicants(tournamentDataReps, tournamentDataStore);
    await setUpReplicants(activeRoundReps, activeRoundStore);
    const app = createApp(Panel);
    app.use(tournamentDataStore, tournamentDataStoreKey);
    app.use(activeRoundStore, activeRoundStoreKey);
    app.mount('#app');
})();
