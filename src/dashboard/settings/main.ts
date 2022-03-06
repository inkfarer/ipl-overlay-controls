import '../styles/globalStyles.scss';
import { setUpReplicants } from '../helpers/storeHelper';
import { settingsReps, settingsStore, settingsStoreKey } from './settingsStore';
import Panel from './settings.vue';
import { createApp } from 'vue';
import { setUpErrorHandler } from '../store/errorHandlerStore';
import { obsReps, obsStore, obsStoreKey } from '../store/obsStore';
import { createPinia } from 'pinia';

(async () => {
    await setUpReplicants(settingsReps, settingsStore);
    await setUpReplicants(obsReps, obsStore);
    const app = createApp(Panel);
    app.use(createPinia());
    setUpErrorHandler(app);
    app.use(settingsStore, settingsStoreKey);
    app.use(obsStore, obsStoreKey);
    app.mount('#app');
})();
