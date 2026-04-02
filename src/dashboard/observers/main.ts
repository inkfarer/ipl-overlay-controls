import '../styles/globalStyles.scss';
import { setUpPiniaReplicants } from '../helpers/storeHelper';
import { createApp } from 'vue';
import { setUpErrorHandler } from '../store/errorHandlerStore';
import { createPinia } from 'pinia';
import { initI18n } from '../helpers/i18n';
import I18NextVue from 'i18next-vue';
import i18next from 'i18next';
import { observerReps, useObserverStore } from '../store/observerStore';
import ObserversPanel from './ObserversPanel.vue';

(async () => {
    const app = createApp(ObserversPanel);
    app.use(createPinia());
    await setUpPiniaReplicants(observerReps, useObserverStore());
    setUpErrorHandler(app);
    await initI18n('observers');
    app.use(I18NextVue, { i18next });
    app.mount('#app');
})();
