import '../styles/globalStyles.scss';
import { setUpPiniaReplicants } from '../helpers/storeHelper';
import { breakScreenReps, useBreakScreenStore } from './breakScreenStore';
import Panel from './breakScreen.vue';
import { createApp } from 'vue';
import { setUpErrorHandler } from '../store/errorHandlerStore';
import { createPinia } from 'pinia';
import { initI18n } from '../helpers/i18n';
import I18NextVue from 'i18next-vue';
import i18next from 'i18next';

(async () => {
    const app = createApp(Panel);
    app.use(createPinia());
    setUpErrorHandler(app);
    await setUpPiniaReplicants(breakScreenReps, useBreakScreenStore());
    await initI18n('breakScreen');
    app.use(I18NextVue, { i18next });
    app.mount('#app');
})();
