import '../styles/globalStyles.scss';
import { setUpReplicants } from '../helpers/storeHelper';
import Panel from './music.vue';
import { createApp } from 'vue';
import { musicReps, musicStore, musicStoreKey } from './musicStore';

setUpReplicants(musicReps, musicStore).then(() => {
    const app = createApp(Panel);
    app.use(musicStore, musicStoreKey);
    app.mount('#app');
});
