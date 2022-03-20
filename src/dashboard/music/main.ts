import '../styles/globalStyles.scss';
import { setUpPiniaReplicants } from '../helpers/storeHelper';
import Panel from './music.vue';
import { createApp } from 'vue';
import { musicReps, useMusicStore } from './musicStore';
import { setUpErrorHandler } from '../store/errorHandlerStore';
import { createPinia } from 'pinia';

(async () => {
    const app = createApp(Panel);
    app.use(createPinia());
    setUpErrorHandler(app);
    await setUpPiniaReplicants(musicReps, useMusicStore());
    app.mount('#app');
})();
