import '../styles/globalStyles.scss';
import { setUpReplicants } from '../helpers/storeHelper';
import Panel from './nextMatch.vue';
import { createApp } from 'vue';
import { highlightedMatchReps, highlightedMatchStore, highlightedMatchStoreKey } from './highlightedMatchStore';
import { tournamentDataReps, tournamentDataStore, tournamentDataStoreKey } from '../store/tournamentDataStore';
import { setUpErrorHandler } from '../store/errorHandlerStore';
import { nextRoundReps, nextRoundStore, nextRoundStoreKey } from '../store/nextRoundStore';

(async () => {
    await setUpReplicants(highlightedMatchReps, highlightedMatchStore);
    await setUpReplicants(tournamentDataReps, tournamentDataStore);
    await setUpReplicants(nextRoundReps, nextRoundStore);
    const app = createApp(Panel);
    setUpErrorHandler(app);
    app.use(highlightedMatchStore, highlightedMatchStoreKey);
    app.use(tournamentDataStore, tournamentDataStoreKey);
    app.use(nextRoundStore, nextRoundStoreKey);
    app.mount('#app');
})();
