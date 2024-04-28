import { LastFmSettings, RadiaSettings, RuntimeConfig } from 'schemas';
import { GameVersion } from 'types/enums/gameVersion';
import { SetGameVersionResponse } from 'types/messages/runtimeConfig';
import { defineStore } from 'pinia';
import { Locale } from 'types/enums/Locale';
import { perGameData } from '../../helpers/gameData/gameData';
import { InterfaceLocale } from 'types/enums/InterfaceLocale';

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
    getters: {
        translatedModeName: state =>
            (mode: string) => (perGameData[state.runtimeConfig.gameVersion]
                .modes[state.runtimeConfig.locale] as Record<string, string>)[mode],
        translatedStageName: state =>
            (stage: string) => (perGameData[state.runtimeConfig.gameVersion]
                .stages[state.runtimeConfig.locale] as Record<string, string>)[stage],
    },
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
        },
        setLocale(newValue: Locale): Promise<void> {
            return nodecg.sendMessage('setLocale', newValue);
        },
        setInterfaceLocale(newValue: `${InterfaceLocale}`) {
            runtimeConfig.value.interfaceLocale = newValue;
        }
    }
});
