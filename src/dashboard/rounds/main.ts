import '../styles/globalStyles.scss';
import { setUpPiniaReplicants } from '../helpers/storeHelper';
import Panel from './rounds.vue';
import { createApp } from 'vue';
import { tournamentDataReps, useTournamentDataStore } from '../store/tournamentDataStore';
import { activeRoundReps, useActiveRoundStore } from '../store/activeRoundStore';
import { nextRoundReps, useNextRoundStore } from '../store/nextRoundStore';
import { setUpErrorHandler } from '../store/errorHandlerStore';
import { settingsReps, useSettingsStore } from '../store/settingsStore';
import { createPinia } from 'pinia';
import { initI18n } from '../helpers/i18n';
import I18NextVue from 'i18next-vue';
import i18next from 'i18next';

(async () => {
    const app = createApp(Panel);
    app.use(createPinia());
    await setUpPiniaReplicants(settingsReps, useSettingsStore());
    await setUpPiniaReplicants(tournamentDataReps, useTournamentDataStore());
    await setUpPiniaReplicants(nextRoundReps, useNextRoundStore());
    await setUpPiniaReplicants(activeRoundReps, useActiveRoundStore());
    setUpErrorHandler(app);
    await initI18n('rounds');
    app.use(I18NextVue, { i18next });
    app.mount('#app');
})();
