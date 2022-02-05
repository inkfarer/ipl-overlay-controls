import { NextRound } from 'schemas';
import { createStore, Store, useStore } from 'vuex';
import cloneDeep from 'lodash/cloneDeep';
import { InjectionKey } from 'vue';
import { SetNextRoundRequest } from 'types/messages/rounds';
import { BeginNextMatchRequest } from 'types/messages/activeRound';

const nextRound = nodecg.Replicant<NextRound>('nextRound');

export const nextRoundReps = [ nextRound ];

export interface NextRoundStore {
    nextRound: NextRound;
}

export const nextRoundStore = createStore<NextRoundStore>({
    state: {
        nextRound: null
    },
    mutations: {
        setState(store, { name, val }: { name: string, val: unknown }): void {
            this.state[name] = cloneDeep(val);
        },
        setShowOnStream(store, newValue: boolean) {
            nextRound.value.showOnStream = newValue;
        }
    },
    actions: {
        beginNextMatch(store, request: BeginNextMatchRequest): void {
            nodecg.sendMessage('beginNextMatch', request);
        },
        setNextRound(store, {
            teamAId,
            teamBId,
            roundId
        }: { teamAId: string, teamBId: string, roundId: string }): void {
            nodecg.sendMessage('setNextRound', { teamAId, teamBId, roundId } as SetNextRoundRequest);
        },
    }
});

export const nextRoundStoreKey: InjectionKey<Store<NextRoundStore>> = Symbol();

export function useNextRoundStore(): Store<NextRoundStore> {
    return useStore(nextRoundStoreKey);
}
