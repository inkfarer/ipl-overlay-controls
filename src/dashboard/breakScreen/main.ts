import '../styles/globalStyles.scss';
import { setUpReplicants } from '../helpers/storeHelper';
import { breakScreenReps, breakScreenStore, breakScreenStoreKey } from './breakScreenStore';
import Panel from './breakScreen.vue';
import { createApp } from 'vue';

setUpReplicants(breakScreenReps, breakScreenStore).then(() => {
    const app = createApp(Panel);
    app.use(breakScreenStore, breakScreenStoreKey);
    app.mount('#app');
});
