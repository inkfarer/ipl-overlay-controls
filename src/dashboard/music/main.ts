import '../styles/globalStyles.scss';
import { setUpPiniaReplicants } from '../helpers/storeHelper';
import Panel from './music.vue';
import { createApp } from 'vue';
import { musicReps, useMusicStore } from './musicStore';
import { setUpErrorHandler } from '../store/errorHandlerStore';
import { createPinia } from 'pinia';
import { initI18n } from '../helpers/i18n';
import i18next from 'i18next';
import I18NextVue from 'i18next-vue';

(async () => {
    const app = createApp(Panel);
    app.use(createPinia());
    setUpErrorHandler(app);
    await setUpPiniaReplicants(musicReps, useMusicStore());
    await initI18n('music');
    app.use(I18NextVue, { i18next });
    app.mount('#app');
})();
