import { Caster, Casters, RadiaSettings } from 'schemas';
import { generateId } from '../../helpers/generateId';
import { defineStore } from 'pinia';
import { sendMessage } from '../helpers/nodecgHelper';
import { isBlank } from '../../helpers/stringHelper';

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
    getters: {
        radiaIntegrationEnabled: state => state.radiaSettings.enabled && !isBlank(state.radiaSettings.guildID)
    },
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
        async createCaster(caster: Caster): Promise<string> {
            return nodecg.sendMessage<string>('saveCaster', caster);
        },
        async loadCastersFromVc(): Promise<void> {
            const result = await sendMessage('getLiveCommentators');

            Object.entries(result.extra).forEach(([id, caster]) => {
                this.addUncommittedCaster({ id, caster });
            });
        },
        showCasters() {
            nodecg.sendMessage('mainShowCasters');
        },
        async removeCaster(id: string): Promise<void> {
            return nodecg.sendMessage('removeCaster', { id });
        },
        async setCasterOrder(casterIds: string[]): Promise<void> {
            return nodecg.sendMessage('setCasterOrder', { casterIds });
        }
    }
});
