import '../styles/globalStyles.scss';
import { setUpReplicants } from '../helpers/storeHelper';
import Panel from './scoreboard.vue';
import { createApp } from 'vue';
import { scoreboardReps, scoreboardStore, scoreboardStoreKey } from '../store/scoreboardStore';

setUpReplicants(scoreboardReps, scoreboardStore).then(() => {
    const app = createApp(Panel);
    app.use(scoreboardStore, scoreboardStoreKey);
    app.mount('#app');
});
