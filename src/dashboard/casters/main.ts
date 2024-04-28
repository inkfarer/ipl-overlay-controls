import '../styles/globalStyles.scss';
import { setUpPiniaReplicants } from '../helpers/storeHelper';
import { castersReps, useCasterStore } from '../store/casterStore';
import Panel from './casters.vue';
import { createApp } from 'vue';
import { setUpErrorHandler } from '../store/errorHandlerStore';
import { createPinia } from 'pinia';
import { IplExpandingSpaceGroup } from '@iplsplatoon/vue-components';
import { initI18n } from '../helpers/i18n';
import I18NextVue from 'i18next-vue';
import i18next from 'i18next';

(async () => {
    const app = createApp(Panel);
    app.use(createPinia());
    await setUpPiniaReplicants(castersReps, useCasterStore());
    setUpErrorHandler(app);
    // Registered globally so it can be used by vuedraggable
    app.component('IplExpandingSpaceGroup', IplExpandingSpaceGroup);
    await initI18n('casters');
    app.use(I18NextVue, { i18next });
    app.mount('#app');
})();
