import '../styles/globalStyles.scss';
import { setUpPiniaReplicants, setUpReplicants } from '../helpers/storeHelper';
import Panel from './matchManager.vue';
import { createApp } from 'vue';
import { tournamentDataReps, useTournamentDataStore } from '../store/tournamentDataStore';
import { activeRoundReps, useActiveRoundStore } from '../store/activeRoundStore';
import { castersReps, useCasterStore } from '../store/casterStore';
import { scoreboardReps, useScoreboardStore } from '../store/scoreboardStore';
import { setUpErrorHandler } from '../store/errorHandlerStore';
import { nextRoundReps, useNextRoundStore } from '../store/nextRoundStore';
import { settingsReps, settingsStore, settingsStoreKey } from '../settings/settingsStore';
import { obsReps, useObsStore } from '../store/obsStore';
import { createPinia } from 'pinia';

(async () => {
    await setUpReplicants(settingsReps, settingsStore);
    const app = createApp(Panel);
    app.use(createPinia());
    await setUpPiniaReplicants(tournamentDataReps, useTournamentDataStore());
    await setUpPiniaReplicants(scoreboardReps, useScoreboardStore());
    await setUpPiniaReplicants(obsReps, useObsStore());
    await setUpPiniaReplicants(nextRoundReps, useNextRoundStore());
    await setUpPiniaReplicants(activeRoundReps, useActiveRoundStore());
    await setUpPiniaReplicants(castersReps, useCasterStore());
    setUpErrorHandler(app);
    app.use(settingsStore, settingsStoreKey);
    app.mount('#app');
})();
