import type NodeCGTypes from '@nodecg/types';
import type * as Pinia from 'pinia';
import cloneDeep from 'lodash/cloneDeep';

export async function setUpPiniaReplicants(
    reps: NodeCGTypes.ClientReplicant<unknown>[],
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
