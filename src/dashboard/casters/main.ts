import '../styles/globalStyles.scss';
import { setUpReplicants } from '../helpers/storeHelper';
import { castersReps, casterStore, casterStoreKey } from './casterStore';
import Panel from './casters.vue';
import { createApp } from 'vue';

setUpReplicants(castersReps, casterStore).then(() => {
    const app = createApp(Panel);
    app.use(casterStore, casterStoreKey);
    app.mount('#app');
});
