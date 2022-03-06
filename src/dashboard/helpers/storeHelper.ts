import { ReplicantBrowser } from 'nodecg/browser';
import type * as Pinia from 'pinia';
import cloneDeep from 'lodash/cloneDeep';

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
