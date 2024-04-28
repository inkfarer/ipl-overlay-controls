import { PredictionStore } from 'schemas';
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
            return nodecg.sendMessage('patchPrediction', {
                status: PredictionStatus.LOCKED
            });
        },
        async cancelPrediction() {
            return nodecg.sendMessage('patchPrediction', {
                status: PredictionStatus.CANCELED
            });
        },
        async resolvePrediction({ winningOutcomeIndex }: { winningOutcomeIndex: number }) {
            if (winningOutcomeIndex > 1 || winningOutcomeIndex < 0) {
                throw new Error(`Cannot resolve prediction with outcome index ${winningOutcomeIndex}. This is a bug!`);
            }

            return nodecg.sendMessage('patchPrediction', {
                status: PredictionStatus.RESOLVED,
                winning_outcome_id: this.predictionStore.currentPrediction.outcomes[winningOutcomeIndex].id
            });
        },
        async createPrediction(
            { title, teamAName, teamBName, duration }:
                { title: string, teamAName: string, teamBName: string, duration: number }
        ) {
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
