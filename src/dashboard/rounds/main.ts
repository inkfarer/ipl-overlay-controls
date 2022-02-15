import '../../browser/styles/globalStyles.scss';
import { setUpReplicants } from '../helpers/storeHelper';
import Panel from './rounds.vue';
import { createApp } from 'vue';
import { tournamentDataReps, tournamentDataStore, tournamentDataStoreKey } from '../store/tournamentDataStore';
import { activeRoundReps, activeRoundStore, activeRoundStoreKey } from '../store/activeRoundStore';
import { nextRoundReps, nextRoundStore, nextRoundStoreKey } from '../store/nextRoundStore';
import { setUpErrorHandler } from '../store/errorHandlerStore';
import { settingsReps, settingsStore, settingsStoreKey } from '../settings/settingsStore';

(async () => {
    await setUpReplicants(tournamentDataReps, tournamentDataStore);
    await setUpReplicants(activeRoundReps, activeRoundStore);
    await setUpReplicants(nextRoundReps, nextRoundStore);
    await setUpReplicants(settingsReps, settingsStore);
    const app = createApp(Panel);
    setUpErrorHandler(app);
    app.use(tournamentDataStore, tournamentDataStoreKey);
    app.use(activeRoundStore, activeRoundStoreKey);
    app.use(nextRoundStore, nextRoundStoreKey);
    app.use(settingsStore, settingsStoreKey);
    app.mount('#app');
})();
