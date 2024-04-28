import '../styles/globalStyles.scss';
import { setUpPiniaReplicants } from '../helpers/storeHelper';
import Panel from './nextMatch.vue';
import { createApp } from 'vue';
import { highlightedMatchReps, useHighlightedMatchStore } from './highlightedMatchStore';
import { tournamentDataReps, useTournamentDataStore } from '../store/tournamentDataStore';
import { setUpErrorHandler } from '../store/errorHandlerStore';
import { nextRoundReps, useNextRoundStore } from '../store/nextRoundStore';
import { createPinia } from 'pinia';
import { initI18n } from '../helpers/i18n';
import I18NextVue from 'i18next-vue';
import i18next from 'i18next';

(async () => {
    const app = createApp(Panel);
    app.use(createPinia());
    await setUpPiniaReplicants(highlightedMatchReps, useHighlightedMatchStore());
    await setUpPiniaReplicants(tournamentDataReps, useTournamentDataStore());
    await setUpPiniaReplicants(nextRoundReps, useNextRoundStore());
    setUpErrorHandler(app);
    await initI18n('nextMatch');
    app.use(I18NextVue, { i18next });
    app.mount('#app');
})();
