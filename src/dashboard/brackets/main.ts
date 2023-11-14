import '../styles/globalStyles.scss';
import { setUpPiniaReplicants } from '../helpers/storeHelper';
import BracketsPanel from './BracketsPanel.vue';
import { createApp } from 'vue';
import { setUpErrorHandler } from '../store/errorHandlerStore';
import { createPinia } from 'pinia';
import { tournamentDataReps, useTournamentDataStore } from '../store/tournamentDataStore';
import { bracketReps, useBracketStore } from '../store/bracketStore';

(async () => {
    const app = createApp(BracketsPanel);
    app.use(createPinia());
    await setUpPiniaReplicants(tournamentDataReps, useTournamentDataStore());
    await setUpPiniaReplicants(bracketReps, useBracketStore());
    setUpErrorHandler(app);
    app.mount('#app');
})();
