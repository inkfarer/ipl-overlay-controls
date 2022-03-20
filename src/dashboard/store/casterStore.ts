import { NodeCGBrowser } from 'nodecg/browser';
import { Caster, Casters, RadiaSettings } from 'schemas';
import { generateId } from '../../helpers/generateId';
import { defineStore } from 'pinia';

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

export const useCasterStore = defineStore('casters', {
    state: () => ({
        casters: {},
        uncommittedCasters: {},
        radiaSettings: {
            enabled: null,
            guildID: null,
            updateOnImport: null
        }
    } as CasterStore),
    actions: {
        updateCaster({ id, newValue }: { id: string, newValue: Caster }): void {
            casters.value[id] = newValue;
        },
        removeUncommittedCaster(id: string): void {
            delete this.uncommittedCasters[id];
        },
        addUncommittedCaster({ id, caster }: { id: string, caster?: Caster }): void {
            this.uncommittedCasters[id] = caster ?? defaultCaster;
        },
        addDefaultCaster(): string {
            const id = generateId();
            this.addUncommittedCaster({ id });
            return id;
        },
        async saveUncommittedCaster({ id, caster }: { id: string, caster: Caster }): Promise<string> {
            const newId = await nodecg.sendMessage('saveCaster', caster);
            this.removeUncommittedCaster(id);
            return newId;
        },
        async loadCastersFromVc(): Promise<void> {
            const result = await nodecg.sendMessage('getLiveCommentators');
            if (result.extra && result.extra.length > 0) {
                for (let i = 0; i < result.extra.length; i++) {
                    const extraCaster = result.extra[i];
                    const id = extraCaster.discord_user_id;
                    delete extraCaster.discord_user_id;
                    this.addUncommittedCaster({ id, caster: extraCaster });
                }
            }
        },
        showCasters() {
            nodecg.sendMessage('mainShowCasters');
        },
        async removeCaster(id: string): Promise<void> {
            return nodecg.sendMessage('removeCaster', { id });
        }
    }
});
