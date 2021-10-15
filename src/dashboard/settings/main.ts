import '../styles/globalStyles.scss';
import { setUpReplicants } from '../helpers/storeHelper';
import { settingsReps, settingsStore, settingsStoreKey } from './settingsStore';
import Panel from './settings.vue';
import { createApp } from 'vue';

setUpReplicants(settingsReps, settingsStore).then(() => {
    const app = createApp(Panel);
    app.use(settingsStore, settingsStoreKey);
    app.mount('#app');
});
