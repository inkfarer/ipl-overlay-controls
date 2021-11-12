import { NodeCGBrowser } from 'nodecg/browser';
import { createStore, Store, useStore } from 'vuex';
import cloneDeep from 'lodash/cloneDeep';
import { InjectionKey } from 'vue';
import { Prediction, PredictionStore } from 'schemas';
import { PredictionStatus } from 'types/enums/predictionStatus';

export const predictionStore = nodecg.Replicant<PredictionStore>('predictionStore');

export const predictionReps = [ predictionStore ];

export interface PredictionDataStore {
    predictionStore: PredictionStore;
}

export const predictionDataStore = createStore<PredictionDataStore>({
    state: {
        predictionStore: null,
    },
    mutations: {
        setState(store, { name, val }: { name: string, val: unknown }): void {
            this.state[name] = cloneDeep(val);
        },
    },
    actions: {
        async lockPrediction(store) {
            return patchPrediction(
                store.state.predictionStore.currentPrediction,
                PredictionStatus.LOCKED,
                [ PredictionStatus.ACTIVE ]);
        },
        async cancelPrediction(store) {
            return patchPrediction(
                store.state.predictionStore.currentPrediction,
                PredictionStatus.CANCELED,
                [ PredictionStatus.ACTIVE, PredictionStatus.LOCKED ]);
        },
        async resolvePrediction(store, { winningOutcomeIndex }: { winningOutcomeIndex: number }) {
            if (winningOutcomeIndex > 1 || winningOutcomeIndex < 0) {
                throw new Error(`Cannot resolve prediction with outcome index ${winningOutcomeIndex}.`);
            } else if (!store.state.predictionStore.currentPrediction?.id) {
                throw new Error('No prediction to resolve.');
            }

            return nodecg.sendMessage('patchPrediction', {
                id: store.state.predictionStore.currentPrediction.id,
                status: PredictionStatus.RESOLVED,
                winning_outcome_id: store.state.predictionStore.currentPrediction.outcomes[winningOutcomeIndex].id
            });
        }
    }
});

async function patchPrediction(
    currentPrediction: Prediction,
    status: PredictionStatus,
    allowedForStatuses: PredictionStatus[]
): Promise<void> {
    if (!currentPrediction || !allowedForStatuses.includes(currentPrediction?.status as PredictionStatus)
    ) {
        throw new Error(`Cannot set prediction status at this time. Status must match one of [${allowedForStatuses.join(', ')}]`);
    }

    return nodecg.sendMessage('patchPrediction', {
        id: currentPrediction.id,
        status: status,
    });
}

export const predictionDataStoreKey: InjectionKey<Store<PredictionDataStore>> = Symbol();

export function usePredictionDataStore(): Store<PredictionDataStore> {
    return useStore(predictionDataStoreKey);
}
