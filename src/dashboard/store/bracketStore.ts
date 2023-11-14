import { Bracket } from '@tourneyview/common';
import { defineStore } from 'pinia';

const bracketData = nodecg.Replicant<Bracket | undefined>('bracketData');

export const bracketReps = [ bracketData ];

export interface BracketStore {
    bracketData: Bracket | undefined;
}

export const useBracketStore = defineStore('brackets', {
    state: () => ({
        bracketData: undefined
    } as BracketStore),
    actions: {
        resetBracketData() {
            bracketData.value = undefined;
        }
    }
});
