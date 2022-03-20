import '../styles/globalStyles.scss';
import { setUpPiniaReplicants } from '../helpers/storeHelper';
import { breakScreenReps, useBreakScreenStore } from './breakScreenStore';
import Panel from './breakScreen.vue';
import { createApp } from 'vue';
import { setUpErrorHandler } from '../store/errorHandlerStore';
import { createPinia } from 'pinia';

(async () => {
    const app = createApp(Panel);
    app.use(createPinia());
    setUpErrorHandler(app);
    await setUpPiniaReplicants(breakScreenReps, useBreakScreenStore());
    app.mount('#app');
})();
