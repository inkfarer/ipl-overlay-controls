import { ActiveRound, SwapColorsInternally } from 'schemas';
import { createStore, Store, useStore } from 'vuex';
import cloneDeep from 'lodash/cloneDeep';
import { InjectionKey } from 'vue';
import { GameWinner } from 'types/enums/gameWinner';

const activeRound = nodecg.Replicant<ActiveRound>('activeRound');
const swapColorsInternally = nodecg.Replicant<SwapColorsInternally>('swapColorsInternally');

export const activeRoundReps = [ activeRound, swapColorsInternally ];

export interface ActiveRoundStore {
    activeRound: ActiveRound;
    swapColorsInternally: SwapColorsInternally;
}

export const activeRoundStore = createStore<ActiveRoundStore>({
    state: {
        activeRound: null,
        swapColorsInternally: null
    },
    mutations: {
        setState(store, { name, val }: { name: string, val: unknown }): void {
            this.state[name] = cloneDeep(val);
        }
    },
    actions: {
        setWinner(store, { winner }: { winner: GameWinner }): void {
            nodecg.sendMessage('setWinner', { winner });
        },
        removeWinner(): void {
            nodecg.sendMessage('removeWinner');
        }
    }
});

export const activeRoundStoreKey: InjectionKey<Store<ActiveRoundStore>> = Symbol();

export function useActiveRoundStore(): Store<ActiveRoundStore> {
    return useStore(activeRoundStoreKey);
}
