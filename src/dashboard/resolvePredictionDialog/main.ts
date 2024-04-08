import '../styles/globalStyles.scss';
import '../styles/dialogStyles.scss';
import { setUpPiniaReplicants } from '../helpers/storeHelper';
import Panel from './resolvePredictionDialog.vue';
import { createApp } from 'vue';
import { predictionReps, usePredictionDataStore } from '../store/predictionDataStore';
import { activeRoundReps, useActiveRoundStore } from '../store/activeRoundStore';
import { setUpErrorHandler } from '../store/errorHandlerStore';
import { createPinia } from 'pinia';
import { initI18n } from '../helpers/i18n';
import I18NextVue from 'i18next-vue';
import i18next from 'i18next';

(async () => {
    const app = createApp(Panel);

    app.use(createPinia());
    await setUpPiniaReplicants(activeRoundReps, useActiveRoundStore());
    await setUpPiniaReplicants(predictionReps, usePredictionDataStore());
    setUpErrorHandler(app);
    await initI18n('resolvePredictionDialog');
    app.use(I18NextVue, { i18next });
    app.mount('#app');
})();
