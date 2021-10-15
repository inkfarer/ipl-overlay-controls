import { ReplicantBrowser } from 'nodecg/browser';
import { Store } from 'vuex';

export async function setUpReplicants(reps: ReplicantBrowser<unknown>[], store: Store<unknown>): Promise<void> {
    reps.forEach(rep => {
        rep.on('change', newValue => {
            store.commit('setState', { name: rep.name, val: newValue });
        });
    });
    await NodeCG.waitForReplicants(...Object.values(reps));
}
