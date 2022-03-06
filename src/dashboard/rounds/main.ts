import '../styles/globalStyles.scss';
import { setUpPiniaReplicants, setUpReplicants } from '../helpers/storeHelper';
import Panel from './rounds.vue';
import { createApp } from 'vue';
import { tournamentDataReps, tournamentDataStore, tournamentDataStoreKey } from '../store/tournamentDataStore';
import { activeRoundReps, useActiveRoundStore } from '../store/activeRoundStore';
import { nextRoundReps, useNextRoundStore } from '../store/nextRoundStore';
import { setUpErrorHandler } from '../store/errorHandlerStore';
import { settingsReps, settingsStore, settingsStoreKey } from '../settings/settingsStore';
import { createPinia } from 'pinia';

(async () => {
    await setUpReplicants(tournamentDataReps, tournamentDataStore);
    await setUpReplicants(settingsReps, settingsStore);
    const app = createApp(Panel);
    app.use(createPinia());
    await setUpPiniaReplicants(nextRoundReps, useNextRoundStore());
    await setUpPiniaReplicants(activeRoundReps, useActiveRoundStore());
    setUpErrorHandler(app);
    app.use(tournamentDataStore, tournamentDataStoreKey);
    app.use(settingsStore, settingsStoreKey);
    app.mount('#app');
})();
