import '../styles/globalStyles.scss';
import { setUpPiniaReplicants } from '../helpers/storeHelper';
import BracketsPanel from './BracketsPanel.vue';
import { createApp } from 'vue';
import { setUpErrorHandler } from '../store/errorHandlerStore';
import { createPinia } from 'pinia';
import { tournamentDataReps, useTournamentDataStore } from '../store/tournamentDataStore';
import { bracketReps, useBracketStore } from '../store/bracketStore';
import { initI18n } from '../helpers/i18n';
import I18NextVue from 'i18next-vue';
import i18next from 'i18next';

(async () => {
    const app = createApp(BracketsPanel);
    app.use(createPinia());
    await setUpPiniaReplicants(tournamentDataReps, useTournamentDataStore());
    await setUpPiniaReplicants(bracketReps, useBracketStore());
    setUpErrorHandler(app);
    await initI18n('brackets');
    app.use(I18NextVue, { i18next });
    app.mount('#app');
})();
