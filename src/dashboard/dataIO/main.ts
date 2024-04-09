import '../styles/globalStyles.scss';
import { setUpPiniaReplicants } from '../helpers/storeHelper';
import { createApp } from 'vue';
import { tournamentDataReps, useTournamentDataStore } from '../store/tournamentDataStore';
import DataImport from './dataIO.vue';
import { setUpErrorHandler } from '../store/errorHandlerStore';
import { createPinia } from 'pinia';
import { initI18n } from '../helpers/i18n';
import I18NextVue from 'i18next-vue';
import i18next from 'i18next';

(async () => {
    const app = createApp(DataImport);
    app.use(createPinia());
    await setUpPiniaReplicants(tournamentDataReps, useTournamentDataStore());
    setUpErrorHandler(app);
    await initI18n('dataIO');
    app.use(I18NextVue, { i18next });
    app.mount('#app');
})();
