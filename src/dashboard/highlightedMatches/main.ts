import '../styles/globalStyles.scss';
import { setUpReplicants } from '../helpers/storeHelper';
import Panel from './highlightedMatches.vue';
import { createApp } from 'vue';
import { highlightedMatchReps, highlightedMatchStore, highlightedMatchStoreKey } from './highlightedMatchStore';
import { setUpErrorHandler } from '../store/errorHandlerStore';

setUpReplicants(highlightedMatchReps, highlightedMatchStore).then(() => {
    const app = createApp(Panel);
    setUpErrorHandler(app);
    app.use(highlightedMatchStore, highlightedMatchStoreKey);
    app.mount('#app');
});
