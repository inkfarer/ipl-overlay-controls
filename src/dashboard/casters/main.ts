import '../../browser/styles/globalStyles.scss';
import { setUpReplicants } from '../helpers/storeHelper';
import { castersReps, casterStore, casterStoreKey } from '../store/casterStore';
import Panel from './casters.vue';
import { createApp } from 'vue';
import { setUpErrorHandler } from '../store/errorHandlerStore';

setUpReplicants(castersReps, casterStore).then(() => {
    const app = createApp(Panel);
    setUpErrorHandler(app);
    app.use(casterStore, casterStoreKey);
    app.mount('#app');
});
