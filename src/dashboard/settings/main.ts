import '../styles/globalStyles.scss';
import { setUpPiniaReplicants } from '../helpers/storeHelper';
import { settingsReps, useSettingsStore } from '../store/settingsStore';
import Panel from './settings.vue';
import { createApp } from 'vue';
import { setUpErrorHandler } from '../store/errorHandlerStore';
import { obsReps, useObsStore } from '../store/obsStore';
import { createPinia } from 'pinia';
import { initI18n } from '../helpers/i18n';
import I18NextVue from 'i18next-vue';
import i18next from 'i18next';

(async () => {
    const app = createApp(Panel);
    app.use(createPinia());
    await setUpPiniaReplicants(settingsReps, useSettingsStore());
    await setUpPiniaReplicants(obsReps, useObsStore());
    setUpErrorHandler(app);
    await initI18n('settings');
    app.use(I18NextVue, { i18next });
    app.mount('#app');
})();
