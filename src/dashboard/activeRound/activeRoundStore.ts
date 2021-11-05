import { ActiveRound, SwapColorsInternally } from 'schemas';
import { createStore, Store, useStore } from 'vuex';
import cloneDeep from 'lodash/cloneDeep';
import { InjectionKey } from 'vue';
import { GameWinner } from 'types/enums/gameWinner';
import { SetActiveColorRequest } from 'types/messages/activeRound';
import { SetRoundRequest } from 'types/messages/rounds';

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
        },
        setActiveRound(store, request: SetRoundRequest): void {
            nodecg.sendMessage('setActiveRound', request);
        }
    },
    actions: {
        setWinner(store, { winner }: { winner: GameWinner }): void {
            nodecg.sendMessage('setWinner', { winner });
        },
        removeWinner(): void {
            nodecg.sendMessage('removeWinner');
        },
        setActiveColor(store, request: SetActiveColorRequest): void {
            nodecg.sendMessage('setActiveColor', request);
        },
        swapColors(): void {
            swapColorsInternally.value = !swapColorsInternally.value;
        }
    }
});

export const activeRoundStoreKey: InjectionKey<Store<ActiveRoundStore>> = Symbol();

export function useActiveRoundStore(): Store<ActiveRoundStore> {
    return useStore(activeRoundStoreKey);
}
