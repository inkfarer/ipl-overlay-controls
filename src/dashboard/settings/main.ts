import '../styles/globalStyles.scss';
import { setUpPiniaReplicants, setUpReplicants } from '../helpers/storeHelper';
import { settingsReps, settingsStore, settingsStoreKey } from './settingsStore';
import Panel from './settings.vue';
import { createApp } from 'vue';
import { setUpErrorHandler } from '../store/errorHandlerStore';
import { obsReps, useObsStore } from '../store/obsStore';
import { createPinia } from 'pinia';

(async () => {
    await setUpReplicants(settingsReps, settingsStore);
    const app = createApp(Panel);
    app.use(createPinia());
    await setUpPiniaReplicants(obsReps, useObsStore());
    setUpErrorHandler(app);
    app.use(settingsStore, settingsStoreKey);
    app.mount('#app');
})();
