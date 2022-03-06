import '../styles/globalStyles.scss';
import { setUpPiniaReplicants } from '../helpers/storeHelper';
import Panel from './rounds.vue';
import { createApp } from 'vue';
import { tournamentDataReps, useTournamentDataStore } from '../store/tournamentDataStore';
import { activeRoundReps, useActiveRoundStore } from '../store/activeRoundStore';
import { nextRoundReps, useNextRoundStore } from '../store/nextRoundStore';
import { setUpErrorHandler } from '../store/errorHandlerStore';
import { settingsReps, useSettingsStore } from '../settings/settingsStore';
import { createPinia } from 'pinia';

(async () => {
    const app = createApp(Panel);
    app.use(createPinia());
    await setUpPiniaReplicants(settingsReps, useSettingsStore());
    await setUpPiniaReplicants(tournamentDataReps, useTournamentDataStore());
    await setUpPiniaReplicants(nextRoundReps, useNextRoundStore());
    await setUpPiniaReplicants(activeRoundReps, useActiveRoundStore());
    setUpErrorHandler(app);
    app.mount('#app');
})();
