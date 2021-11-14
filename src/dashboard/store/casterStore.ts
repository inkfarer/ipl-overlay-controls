import { NodeCGBrowser } from 'nodecg/browser';
import { Caster, Casters, RadiaSettings } from 'schemas';
import { createStore, Store, useStore } from 'vuex';
import cloneDeep from 'lodash/cloneDeep';
import { InjectionKey } from 'vue';
import { generateId } from '../../helpers/generateId';

const casters = nodecg.Replicant<Casters>('casters');
const radiaSettings = nodecg.Replicant<RadiaSettings>('radiaSettings');

export const castersReps = [ casters, radiaSettings ];

export interface CasterStore {
    casters: Casters;
    uncommittedCasters: Casters;
    radiaSettings: RadiaSettings;
}

const defaultCaster = {
    name: 'New Caster',
    twitter: '',
    pronouns: '?/?'
};

export const casterStore = createStore<CasterStore>({
    state: {
        casters: {},
        uncommittedCasters: {},
        radiaSettings: {
            enabled: null,
            guildID: null,
            updateOnImport: null
        }
    },
    mutations: {
        setState(store, { name, val }: { name: string, val: unknown }): void {
            this.state[name] = cloneDeep(val);
        },
        updateCaster(store, { id, newValue }: { id: string, newValue: Caster }): void {
            casters.value[id] = newValue;
        },
        removeCaster(store, id: string): void {
            nodecg.sendMessage('removeCaster', { id });
        },
        addUncommittedCaster(store, { id, caster }: { id: string, caster?: Caster }): void {
            store.uncommittedCasters[id] = caster ?? defaultCaster;
        },
        removeUncommittedCaster(store, id: string): void {
            delete store.uncommittedCasters[id];
        }
    },
    actions: {
        addUncommittedCaster(store): string {
            const id = generateId();
            store.commit('addUncommittedCaster', { id });
            return id;
        },
        async saveUncommittedCaster(store, { id, caster }: { id: string, caster: Caster }): Promise<string> {
            const newId = await nodecg.sendMessage('saveCaster', caster);
            store.commit('removeUncommittedCaster', id);
            return newId;
        },
        async loadCastersFromVc(store): Promise<void> {
            const result = await nodecg.sendMessage('getLiveCommentators');
            if (result.extra && result.extra.length > 0) {
                for (let i = 0; i < result.extra.length; i++) {
                    const extraCaster = result.extra[i];
                    const id = extraCaster.discord_user_id;
                    delete extraCaster.discord_user_id;
                    store.commit('addUncommittedCaster', { id, caster: extraCaster });
                }
            }
        },
        showCasters() {
            nodecg.sendMessage('mainShowCasters');
        }
    }
});

export const casterStoreKey: InjectionKey<Store<CasterStore>> = Symbol();

export function useCasterStore(): Store<CasterStore> {
    return useStore(casterStoreKey);
}
