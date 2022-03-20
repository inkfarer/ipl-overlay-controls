import '../styles/globalStyles.scss';
import { setUpPiniaReplicants } from '../helpers/storeHelper';
import { castersReps, useCasterStore } from '../store/casterStore';
import Panel from './casters.vue';
import { createApp } from 'vue';
import { setUpErrorHandler } from '../store/errorHandlerStore';
import { createPinia } from 'pinia';

(async () => {
    const app = createApp(Panel);
    app.use(createPinia());
    await setUpPiniaReplicants(castersReps, useCasterStore());
    setUpErrorHandler(app);
    app.mount('#app');
})();
