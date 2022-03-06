import '../styles/globalStyles.scss';
import { setUpPiniaReplicants, setUpReplicants } from '../helpers/storeHelper';
import Panel from './nextMatch.vue';
import { createApp } from 'vue';
import { highlightedMatchReps, highlightedMatchStore, highlightedMatchStoreKey } from './highlightedMatchStore';
import { tournamentDataReps, tournamentDataStore, tournamentDataStoreKey } from '../store/tournamentDataStore';
import { setUpErrorHandler } from '../store/errorHandlerStore';
import { nextRoundReps, useNextRoundStore } from '../store/nextRoundStore';
import { createPinia } from 'pinia';

(async () => {
    await setUpReplicants(highlightedMatchReps, highlightedMatchStore);
    await setUpReplicants(tournamentDataReps, tournamentDataStore);
    const app = createApp(Panel);
    app.use(createPinia());
    await setUpPiniaReplicants(nextRoundReps, useNextRoundStore());
    setUpErrorHandler(app);
    app.use(highlightedMatchStore, highlightedMatchStoreKey);
    app.use(tournamentDataStore, tournamentDataStoreKey);
    app.mount('#app');
})();
