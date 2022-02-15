import '../../browser/styles/globalStyles.scss';
import { setUpReplicants } from '../helpers/storeHelper';
import { breakScreenReps, breakScreenStore, breakScreenStoreKey } from './breakScreenStore';
import Panel from './breakScreen.vue';
import { createApp } from 'vue';
import { setUpErrorHandler } from '../store/errorHandlerStore';

setUpReplicants(breakScreenReps, breakScreenStore).then(() => {
    const app = createApp(Panel);
    setUpErrorHandler(app);
    app.use(breakScreenStore, breakScreenStoreKey);
    app.mount('#app');
});
