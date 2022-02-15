import '../../browser/styles/globalStyles.scss';
import { setUpReplicants } from '../helpers/storeHelper';
import Panel from './music.vue';
import { createApp } from 'vue';
import { musicReps, musicStore, musicStoreKey } from './musicStore';
import { setUpErrorHandler } from '../store/errorHandlerStore';

setUpReplicants(musicReps, musicStore).then(() => {
    const app = createApp(Panel);
    setUpErrorHandler(app);
    app.use(musicStore, musicStoreKey);
    app.mount('#app');
});
