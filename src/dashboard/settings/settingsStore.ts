import { NodeCGBrowser } from 'nodecg/browser';
import { LastFmSettings, RadiaSettings } from 'schemas';
import { createStore, Store, useStore } from 'vuex';
import cloneDeep from 'lodash/cloneDeep';
import { InjectionKey } from 'vue';

const lastFmSettings = nodecg.Replicant<LastFmSettings>('lastFmSettings');
const radiaSettings = nodecg.Replicant<RadiaSettings>('radiaSettings');

export const settingsReps = [lastFmSettings, radiaSettings];

export interface SettingsStore {
    lastFmSettings: LastFmSettings
    radiaSettings: RadiaSettings
}

export const settingsStore = createStore<SettingsStore>({
    state: {
        lastFmSettings: {},
        radiaSettings: {
            guildID: null,
            enabled: null,
            updateOnImport: null
        }
    },
    mutations: {
        setState(store, { name, val }: { name: string, val: unknown }): void {
            this.state[name] = cloneDeep(val);
        },
        setLastFmSettings(store, { newValue }: { newValue: LastFmSettings }): void {
            lastFmSettings.value = newValue;
        },
        setRadiaSettings(store, { newValue }: { newValue: RadiaSettings }): void {
            radiaSettings.value = newValue;
        }
    }
});

export const settingsStoreKey: InjectionKey<Store<SettingsStore>> = Symbol();

export function useSettingsStore(): Store<SettingsStore> {
    return useStore(settingsStoreKey);
}
