import '../styles/globalStyles.scss';
import { setUpPiniaReplicants } from '../helpers/storeHelper';
import { castersReps, useCasterStore } from '../store/casterStore';
import Panel from './casters.vue';
import { createApp } from 'vue';
import { setUpErrorHandler } from '../store/errorHandlerStore';
import { createPinia } from 'pinia';
import { IplExpandingSpaceGroup } from '@iplsplatoon/vue-components';

(async () => {
    const app = createApp(Panel);
    app.use(createPinia());
    await setUpPiniaReplicants(castersReps, useCasterStore());
    setUpErrorHandler(app);
    // Registered globally so it can be used by vuedraggable
    app.component('IplExpandingSpaceGroup', IplExpandingSpaceGroup);
    app.mount('#app');
})();
