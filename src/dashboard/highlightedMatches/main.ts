import '../styles/globalStyles.scss';
import { setUpReplicants } from '../helpers/storeHelper';
import Panel from './highlightedMatches.vue';
import { createApp } from 'vue';
import { highlightedMatchReps, highlightedMatchStore, highlightedMatchStoreKey } from './highlightedMatchStore';

setUpReplicants(highlightedMatchReps, highlightedMatchStore).then(() => {
    const app = createApp(Panel);
    app.use(highlightedMatchStore, highlightedMatchStoreKey);
    app.mount('#app');
});
