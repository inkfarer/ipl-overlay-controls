import '../styles/globalStyles.scss';
import { setUpReplicants } from '../helpers/storeHelper';
import Panel from './nextRound.vue';
import { createApp } from 'vue';
import { tournamentDataReps, tournamentDataStore, tournamentDataStoreKey } from '../store/tournamentDataStore';
import { nextRoundReps, nextRoundStore, nextRoundStoreKey } from './nextRoundStore';

(async () => {
    await setUpReplicants(tournamentDataReps, tournamentDataStore);
    await setUpReplicants(nextRoundReps, nextRoundStore);
    const app = createApp(Panel);
    app.use(tournamentDataStore, tournamentDataStoreKey);
    app.use(nextRoundStore, nextRoundStoreKey);
    app.mount('#app');
})();
