import '../styles/globalStyles.scss';
import '../styles/dialogStyles.scss';
import { setUpPiniaReplicants } from '../helpers/storeHelper';
import Panel from './createPredictionDialog.vue';
import { createApp } from 'vue';
import { predictionReps, usePredictionDataStore } from '../store/predictionDataStore';
import { nextRoundReps, useNextRoundStore } from '../store/nextRoundStore';
import { setUpErrorHandler } from '../store/errorHandlerStore';
import { createPinia } from 'pinia';
import { initI18n } from '../helpers/i18n';
import I18NextVue from 'i18next-vue';
import i18next from 'i18next';

(async () => {
    const app = createApp(Panel);

    app.use(createPinia());
    await setUpPiniaReplicants(nextRoundReps, useNextRoundStore());
    await setUpPiniaReplicants(predictionReps, usePredictionDataStore());
    setUpErrorHandler(app);
    await initI18n('createPredictionDialog');
    app.use(I18NextVue, { i18next });
    app.mount('#app');
})();
