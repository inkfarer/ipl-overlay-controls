import { NodeCGBrowser } from 'nodecg/browser';
import { LastFmSettings, RadiaSettings, RuntimeConfig } from 'schemas';
import { createStore, Store, useStore } from 'vuex';
import cloneDeep from 'lodash/cloneDeep';
import { InjectionKey } from 'vue';
import { GameVersion } from 'types/enums/gameVersion';
import { SetGameVersionResponse } from 'types/messages/runtimeConfig';

const lastFmSettings = nodecg.Replicant<LastFmSettings>('lastFmSettings');
const radiaSettings = nodecg.Replicant<RadiaSettings>('radiaSettings');
const runtimeConfig = nodecg.Replicant<RuntimeConfig>('runtimeConfig');

export const settingsReps = [lastFmSettings, radiaSettings, runtimeConfig];

export interface SettingsStore {
    lastFmSettings: LastFmSettings
    radiaSettings: RadiaSettings
    runtimeConfig: RuntimeConfig
}

export const settingsStore = createStore<SettingsStore>({
    state: {
        lastFmSettings: {},
        radiaSettings: {
            guildID: null,
            enabled: null,
            updateOnImport: null
        },
        runtimeConfig: null
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
        },
        setUpdateOnImport(store, updateOnImport: boolean): void {
            radiaSettings.value.updateOnImport = updateOnImport;
        }
    },
    actions: {
        async attemptRadiaConnection(): Promise<void> {
            return nodecg.sendMessage('retryRadiaAvailabilityCheck');
        },
        setGameVersion(store, newValue: GameVersion): Promise<SetGameVersionResponse> {
            return nodecg.sendMessage('setGameVersion', { version: newValue });
        }
    }
});

export const settingsStoreKey: InjectionKey<Store<SettingsStore>> = Symbol();

export function useSettingsStore(): Store<SettingsStore> {
    return useStore(settingsStoreKey);
}
