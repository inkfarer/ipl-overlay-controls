import { NodeCGBrowser } from 'nodecg/browser';
import { Prediction, PredictionStore } from 'schemas';
import { PredictionStatus } from 'types/enums/predictionStatus';
import { defineStore } from 'pinia';

const predictionStore = nodecg.Replicant<PredictionStore>('predictionStore');

export const predictionReps = [ predictionStore ];

export interface PredictionDataStore {
    predictionStore: PredictionStore;
}

export const usePredictionDataStore = defineStore('prediction', {
    state: () => ({
        predictionStore: null,
    } as PredictionDataStore),
    actions: {
        async lockPrediction() {
            return patchPrediction(
                this.predictionStore.currentPrediction,
                PredictionStatus.LOCKED,
                [ PredictionStatus.ACTIVE ]);
        },
        async cancelPrediction() {
            return patchPrediction(
                this.predictionStore.currentPrediction,
                PredictionStatus.CANCELED,
                [ PredictionStatus.ACTIVE, PredictionStatus.LOCKED ]);
        },
        async resolvePrediction({ winningOutcomeIndex }: { winningOutcomeIndex: number }) {
            if (winningOutcomeIndex > 1 || winningOutcomeIndex < 0) {
                throw new Error(`Cannot resolve prediction with outcome index ${winningOutcomeIndex}.`);
            } else if (!this.predictionStore.currentPrediction?.id) {
                throw new Error('No prediction to resolve.');
            } else if (this.predictionStore.currentPrediction.status !== PredictionStatus.LOCKED ) {
                throw new Error('Can only resolve a locked prediction.');
            }

            return nodecg.sendMessage('patchPrediction', {
                id: this.predictionStore.currentPrediction.id,
                status: PredictionStatus.RESOLVED,
                winning_outcome_id: this.predictionStore.currentPrediction.outcomes[winningOutcomeIndex].id
            });
        },
        async createPrediction(
            { title, teamAName, teamBName, duration }:
                { title: string, teamAName: string, teamBName: string, duration: number }
        ) {
            if (
                [PredictionStatus.ACTIVE, PredictionStatus.LOCKED]
                    .includes(this.predictionStore.currentPrediction?.status as PredictionStatus)
            ) {
                throw new Error('An unresolved prediction already exists.');
            }

            return nodecg.sendMessage('postPrediction', {
                title,
                outcomes: [
                    { title: teamAName },
                    { title: teamBName }
                ],
                prediction_window: duration
            });
        },
        async reconnect() {
            return nodecg.sendMessage('reconnectToRadiaSocket');
        }
    }
});

async function patchPrediction(
    currentPrediction: Prediction,
    status: PredictionStatus,
    allowedForStatuses: PredictionStatus[]
): Promise<void> {
    if (!currentPrediction || !allowedForStatuses.includes(currentPrediction?.status as PredictionStatus)) {
        throw new Error(`Cannot set prediction status at this time. Status must match one of [${allowedForStatuses.join(', ')}]`);
    }

    return nodecg.sendMessage('patchPrediction', {
        id: currentPrediction.id,
        status: status,
    });
}
