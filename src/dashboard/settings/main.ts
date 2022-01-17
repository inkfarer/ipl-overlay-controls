import '../styles/globalStyles.scss';
import { setUpReplicants } from '../helpers/storeHelper';
import { settingsReps, settingsStore, settingsStoreKey } from './settingsStore';
import Panel from './settings.vue';
import { createApp } from 'vue';
import { setUpErrorHandler } from '../store/errorHandlerStore';

setUpReplicants(settingsReps, settingsStore).then(() => {
    const app = createApp(Panel);
    setUpErrorHandler(app);
    app.use(settingsStore, settingsStoreKey);
    app.mount('#app');
});
