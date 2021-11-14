import { NodeCGBrowser } from 'nodecg/browser';
import { ScoreboardData } from 'schemas';
import { createStore, Store, useStore } from 'vuex';
import cloneDeep from 'lodash/cloneDeep';
import { InjectionKey } from 'vue';

const scoreboardData = nodecg.Replicant<ScoreboardData>('scoreboardData');

export const scoreboardReps = [scoreboardData];

export interface ScoreboardStore {
    scoreboardData: ScoreboardData
}

export const scoreboardStore = createStore<ScoreboardStore>({
    state: {
        scoreboardData: {
            flavorText: '',
            isVisible: null
        }
    },
    mutations: {
        setState(store, { name, val }: { name: string, val: unknown }): void {
            this.state[name] = cloneDeep(val);
        },
        setFlavorText(store, flavorText: string): void {
            scoreboardData.value.flavorText = flavorText;
        },
        setScoreboardVisible(store, isVisible: boolean): void {
            scoreboardData.value.isVisible = isVisible;
        }
    }
});

export const scoreboardStoreKey: InjectionKey<Store<ScoreboardStore>> = Symbol();

export function useScoreboardStore(): Store<ScoreboardStore> {
    return useStore(scoreboardStoreKey);
}
