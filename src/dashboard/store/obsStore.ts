import { NodeCGBrowser } from 'nodecg/browser';
import { ObsCredentials, ObsData } from 'schemas';
import { createStore, Store, useStore } from 'vuex';
import cloneDeep from 'lodash/cloneDeep';
import { InjectionKey } from 'vue';

const obsData = nodecg.Replicant<ObsData>('obsData');
const obsCredentials = nodecg.Replicant<ObsCredentials>('obsCredentials');

export const obsReps = [obsData, obsCredentials];

export interface ObsStore {
    obsData: ObsData
    obsCredentials: ObsCredentials
}

export const obsStore = createStore<ObsStore>({
    state: {
        obsData: null,
        obsCredentials: null
    },
    mutations: {
        setState(store, { name, val }: { name: string, val: unknown }): void {
            this.state[name] = cloneDeep(val);
        }
    },
    actions: {
        connect(store, { address, password }: { address: string, password?: string }): void {
            nodecg.sendMessage('connectToObs', { address, password });
        }
    }
});

export const obsStoreKey: InjectionKey<Store<ObsStore>> = Symbol();

export function useObsStore(): Store<ObsStore> {
    return useStore(obsStoreKey);
}
