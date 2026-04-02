import { defineStore } from 'pinia';
import { isBlank } from '../../helpers/stringHelper';
import { RadiaSettings } from 'schemas';
import { CurrentObservers } from 'types/schemas/currentObservers';

const currentObservers = nodecg.Replicant<CurrentObservers>('currentObservers');
const radiaSettings = nodecg.Replicant<RadiaSettings>('radiaSettings');

export const observerReps = [ currentObservers, radiaSettings ];

interface ObserverStore {
    radiaSettings: RadiaSettings;
    currentObservers: CurrentObservers;
}

export const useObserverStore = defineStore('observers', {
    state: () => ({
        radiaSettings: null,
        currentObservers: [],
    } as unknown as ObserverStore),
    getters: {
        radiaIntegrationEnabled: state => state.radiaSettings.enabled && !isBlank(state.radiaSettings.guildID)
    },
    actions: {
        setCurrentObservers(newValue: CurrentObservers) {
            currentObservers.value = newValue;
        },
        removeObserver(index: number) {
            currentObservers.value = currentObservers.value.toSpliced(index, 1);
        }
    }
});
