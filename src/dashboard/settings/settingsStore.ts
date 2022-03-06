import { NodeCGBrowser } from 'nodecg/browser';
import { LastFmSettings, RadiaSettings, RuntimeConfig } from 'schemas';
import { GameVersion } from 'types/enums/gameVersion';
import { SetGameVersionResponse } from 'types/messages/runtimeConfig';
import { defineStore } from 'pinia';

const lastFmSettings = nodecg.Replicant<LastFmSettings>('lastFmSettings');
const radiaSettings = nodecg.Replicant<RadiaSettings>('radiaSettings');
const runtimeConfig = nodecg.Replicant<RuntimeConfig>('runtimeConfig');

export const settingsReps = [lastFmSettings, radiaSettings, runtimeConfig];

export interface SettingsStore {
    lastFmSettings: LastFmSettings
    radiaSettings: RadiaSettings
    runtimeConfig: RuntimeConfig
}

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        lastFmSettings: {},
        radiaSettings: {
            guildID: null,
            enabled: null,
            updateOnImport: null
        },
        runtimeConfig: null
    } as SettingsStore),
    actions: {
        setLastFmSettings({ newValue }: { newValue: LastFmSettings }): void {
            lastFmSettings.value = newValue;
        },
        setRadiaSettings({ newValue }: { newValue: RadiaSettings }): void {
            radiaSettings.value = newValue;
        },
        setUpdateOnImport(updateOnImport: boolean): void {
            radiaSettings.value.updateOnImport = updateOnImport;
        },
        async attemptRadiaConnection(): Promise<void> {
            return nodecg.sendMessage('retryRadiaAvailabilityCheck');
        },
        setGameVersion(newValue: GameVersion): Promise<SetGameVersionResponse> {
            return nodecg.sendMessage('setGameVersion', { version: newValue });
        }
    }
});
