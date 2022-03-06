import { NextRound } from 'schemas';
import { SetNextRoundRequest } from 'types/messages/rounds';
import { BeginNextMatchRequest } from 'types/messages/activeRound';
import { defineStore } from 'pinia';

const nextRound = nodecg.Replicant<NextRound>('nextRound');

export const nextRoundReps = [ nextRound ];

export interface NextRoundStore {
    nextRound: NextRound;
}

export const useNextRoundStore = defineStore('nextRound', {
    state: () => ({
        nextRound: null
    } as NextRoundStore),
    actions: {
        setShowOnStream(newValue: boolean) {
            nextRound.value.showOnStream = newValue;
        },
        beginNextMatch(request: BeginNextMatchRequest): void {
            nodecg.sendMessage('beginNextMatch', request);
        },
        setNextRound(request: SetNextRoundRequest): void {
            nodecg.sendMessage('setNextRound', request);
        }
    }
});
