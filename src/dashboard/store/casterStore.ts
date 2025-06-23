import { BundleCasterSets, BundleDeclaredConfig, Caster, Casters, RadiaSettings, RuntimeConfig } from 'schemas';
import { generateId } from '../../helpers/generateId';
import { defineStore } from 'pinia';
import { sendMessage } from '../helpers/nodecgHelper';
import { isBlank } from '../../helpers/stringHelper';

const casters = nodecg.Replicant<Casters>('casters');
const radiaSettings = nodecg.Replicant<RadiaSettings>('radiaSettings');
const bundleCasterSets = nodecg.Replicant<BundleCasterSets>('bundleCasterSets');
const bundleDeclaredConfig = nodecg.Replicant<BundleDeclaredConfig>('bundleDeclaredConfig');
const runtimeConfig = nodecg.Replicant<RuntimeConfig>('runtimeConfig');

export const castersReps = [ casters, radiaSettings, runtimeConfig, bundleCasterSets, bundleDeclaredConfig ];

export interface CasterStore {
    casters: Casters;
    uncommittedCasters: Casters;
    radiaSettings: RadiaSettings;
    runtimeConfig: RuntimeConfig;
    bundleCasterSets: BundleCasterSets;
    uncommittedBundleCasters: BundleCasterSets;
    bundleDeclaredConfig: BundleDeclaredConfig;
}

const defaultCaster = {
    name: 'New Caster',
    twitter: '',
    pronouns: '?/?'
};

export const useCasterStore = defineStore('casters', {
    state: () => ({
        casters: {},
        uncommittedCasters: {},
        radiaSettings: {
            enabled: null,
            guildID: null,
            updateOnImport: null
        },
        runtimeConfig: null,
        bundleCasterSets: {},
        uncommittedBundleCasters: {},
        bundleDeclaredConfig: {}
    } as CasterStore),
    getters: {
        radiaIntegrationEnabled: state => state.radiaSettings.enabled && !isBlank(state.radiaSettings.guildID)
    },
    actions: {
        updateCaster(bundleName: string, casterSetKey: string, id: string, newValue: Caster): void {
            if (bundleName === nodecg.bundleName) {
                casters.value[id] = newValue;
            } else {
                bundleCasterSets.value[bundleName][casterSetKey][id] = newValue;
            }
        },
        removeUncommittedCaster(bundleName: string, casterSetKey: string, id: string): void {
            if (bundleName === nodecg.bundleName) {
                delete this.uncommittedCasters[id];
            } else {
                delete this.uncommittedBundleCasters[bundleName][casterSetKey];
            }
        },
        addUncommittedCaster(bundleName: string, casterSetKey: string, id: string, caster?: Caster): void {
            if (bundleName === nodecg.bundleName) {
                this.uncommittedCasters[id] = caster ?? defaultCaster;
            } else {
                if (this.uncommittedBundleCasters[bundleName] == null) {
                    this.uncommittedBundleCasters[bundleName] = { [casterSetKey]: {} };
                } else if (this.uncommittedBundleCasters[bundleName][casterSetKey] == null) {
                    this.uncommittedBundleCasters[bundleName][casterSetKey] = {};
                }

                this.uncommittedBundleCasters[bundleName][casterSetKey][id] = caster ?? defaultCaster;
            }
        },
        addDefaultCaster(bundleName: string, casterSetKey: string): string {
            const id = generateId();
            this.addUncommittedCaster(bundleName, casterSetKey, id);
            return id;
        },
        async createCaster(bundleName: string, casterSetKey: string, caster: Caster): Promise<string> {
            return nodecg.sendMessage<string>('saveCaster', { bundleName, casterSetKey, caster });
        },
        async loadCastersFromVc(): Promise<void> {
            const result = await sendMessage('getLiveCommentators');

            Object.entries(result.extra).forEach(([id, caster]) => {
                this.addUncommittedCaster('ipl-overlay-controls', 'casters', id, caster);
            });
        },
        showCasters() {
            nodecg.sendMessage('mainShowCasters');
        },
        async removeCaster(bundleName: string, casterSetKey: string, id: string): Promise<void> {
            return nodecg.sendMessage('removeCaster', { bundleName, casterSetKey, id });
        },
        async setCasterOrder(bundleName: string, casterSetKey: string, casterIds: string[]): Promise<void> {
            return nodecg.sendMessage('setCasterOrder', { bundleName, casterSetKey, casterIds });
        }
    }
});
