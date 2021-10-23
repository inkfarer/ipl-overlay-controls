import { NodeCGBrowser } from 'nodecg/browser';
import { ActiveBreakScene, MainFlavorText, NextRoundStartTime } from 'schemas';
import { createStore, Store, useStore } from 'vuex';
import cloneDeep from 'lodash/cloneDeep';
import { InjectionKey } from 'vue';

const mainFlavorText = nodecg.Replicant<MainFlavorText>('mainFlavorText');
const nextRoundStartTime = nodecg.Replicant<NextRoundStartTime>('nextRoundStartTime');
const activeBreakScene = nodecg.Replicant<ActiveBreakScene>('activeBreakScene');

export const breakScreenReps = [ mainFlavorText, nextRoundStartTime, activeBreakScene ];

export interface BreakScreenStore {
    mainFlavorText: MainFlavorText;
    nextRoundStartTime: NextRoundStartTime;
    activeBreakScene: ActiveBreakScene;
}

export const breakScreenStore = createStore<BreakScreenStore>({
    state: {
        mainFlavorText: null,
        nextRoundStartTime: null,
        activeBreakScene: null
    },
    mutations: {
        setState(store, { name, val }: { name: string, val: unknown }): void {
            this.state[name] = cloneDeep(val);
        },
        setActiveBreakScene(store, newValue: ActiveBreakScene): void {
            activeBreakScene.value = newValue;
        },
        setMainFlavorText(store, newValue: string): void {
            mainFlavorText.value = newValue;
        },
        setNextRoundStartTimeVisible(store, newValue: boolean): void {
            nextRoundStartTime.value.isVisible = newValue;
        },
        setNextRoundStartTime(store, newValue: string): void {
            nextRoundStartTime.value.startTime = newValue;
        }
    }
});

export const breakScreenStoreKey: InjectionKey<Store<BreakScreenStore>> = Symbol();

export function useBreakScreenStore(): Store<BreakScreenStore> {
    return useStore(breakScreenStoreKey);
}
