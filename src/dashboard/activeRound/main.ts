import '../styles/globalStyles.scss';
import { setUpReplicants } from '../helpers/storeHelper';
import Panel from './activeRound.vue';
import { createApp } from 'vue';
import { tournamentDataReps, tournamentDataStore, tournamentDataStoreKey } from '../store/tournamentDataStore';
import { activeRoundReps, activeRoundStore, activeRoundStoreKey } from '../store/activeRoundStore';
import { castersReps, casterStore, casterStoreKey } from '../store/casterStore';
import { scoreboardReps, scoreboardStore, scoreboardStoreKey } from '../store/scoreboardStore';
import { setUpErrorHandler } from '../store/errorHandlerStore';

(async () => {
    await setUpReplicants(tournamentDataReps, tournamentDataStore);
    await setUpReplicants(activeRoundReps, activeRoundStore);
    await setUpReplicants(castersReps, casterStore);
    await setUpReplicants(scoreboardReps, scoreboardStore);
    const app = createApp(Panel);
    setUpErrorHandler(app);
    app.use(tournamentDataStore, tournamentDataStoreKey);
    app.use(activeRoundStore, activeRoundStoreKey);
    app.use(casterStore, casterStoreKey);
    app.use(scoreboardStore, scoreboardStoreKey);
    app.mount('#app');
})();
