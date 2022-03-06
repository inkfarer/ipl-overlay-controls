import { ReplicantBrowser } from 'nodecg/browser';
import { Store } from 'vuex';
import type * as Pinia from 'pinia';
import cloneDeep from 'lodash/cloneDeep';

export async function setUpReplicants(reps: ReplicantBrowser<unknown>[], store: Store<unknown>): Promise<void> {
    reps.forEach(rep => {
        rep.on('change', newValue => {
            store.commit('setState', { name: rep.name, val: newValue });
        });
    });
    await NodeCG.waitForReplicants(...Object.values(reps));
}

export async function setUpPiniaReplicants(
    reps: ReplicantBrowser<unknown>[],
    store: Pinia.Store<string>
): Promise<void> {
    reps.forEach(rep => {
        rep.on('change', newValue => {
            store.$patch((state: Record<string, unknown>) => {
                state[rep.name] = cloneDeep(newValue);
            });
        });
    });
    await NodeCG.waitForReplicants(...Object.values(reps));
}
