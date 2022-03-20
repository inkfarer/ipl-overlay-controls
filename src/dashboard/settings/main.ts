import '../styles/globalStyles.scss';
import { setUpPiniaReplicants } from '../helpers/storeHelper';
import { settingsReps, useSettingsStore } from './settingsStore';
import Panel from './settings.vue';
import { createApp } from 'vue';
import { setUpErrorHandler } from '../store/errorHandlerStore';
import { obsReps, useObsStore } from '../store/obsStore';
import { createPinia } from 'pinia';

(async () => {
    const app = createApp(Panel);
    app.use(createPinia());
    await setUpPiniaReplicants(settingsReps, useSettingsStore());
    await setUpPiniaReplicants(obsReps, useObsStore());
    setUpErrorHandler(app);
    app.mount('#app');
})();
