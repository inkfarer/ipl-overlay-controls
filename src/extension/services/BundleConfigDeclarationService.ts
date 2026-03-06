import type NodeCG from '@nodecg/types';
import { BundleDeclaredConfig, TranslatableNames } from 'types/schemas/bundleDeclaredConfig';
import { BundleCasterSets } from 'schemas';

const DEFAULT_CASTERS = {
    aAa: {
        name: 'First Caster',
        twitter: '@CasterFirst',
        pronouns: 'he/him'
    },
    bBb: {
        name: 'Second Caster',
        twitter: '@CasterSecond',
        pronouns: 'she/her'
    }
};

type MaybeTranslatableNames = { name: string; } | { names: TranslatableNames; };

export type BundleDeclaredScene = { value: string; } & MaybeTranslatableNames;
export type BundleDeclaredCasterSet = { key: string; maxItems: number; } & MaybeTranslatableNames;

export class BundleConfigDeclarationService {
    private bundleDeclaredConfig: NodeCG.ServerReplicant<BundleDeclaredConfig>;
    private bundleCasterSets: NodeCG.ServerReplicant<BundleCasterSets>;

    constructor(nodecg: NodeCG.ServerAPI) {
        this.bundleDeclaredConfig = nodecg.Replicant('bundleDeclaredConfig', { persistent: false });
        this.bundleCasterSets = nodecg.Replicant('bundleCasterSets');
    }

    declareCustomScenes(bundleName: string, scenes: BundleDeclaredScene[]) {
        const normalizedScenes = this.normalizeNames(scenes);

        if (this.bundleDeclaredConfig.value[bundleName]) {
            this.bundleDeclaredConfig.value[bundleName].scenes = normalizedScenes;
        } else {
            this.bundleDeclaredConfig.value[bundleName] = { scenes: normalizedScenes };
        }
    }

    declareCasterSets(bundleName: string, casterSets: BundleDeclaredCasterSet[]) {
        const normalizedCasterSets = this.normalizeNames(casterSets);

        if (this.bundleDeclaredConfig.value[bundleName]) {
            this.bundleDeclaredConfig.value[bundleName].casterSets = normalizedCasterSets;
        } else {
            this.bundleDeclaredConfig.value[bundleName] = { casterSets: normalizedCasterSets };
        }

        if (this.bundleCasterSets.value[bundleName] == null) {
            this.bundleCasterSets.value[bundleName] = {};
        }
        normalizedCasterSets.forEach(casterSet => {
            if (this.bundleCasterSets.value[bundleName][casterSet.key] == null) {
                this.bundleCasterSets.value[bundleName][casterSet.key] = DEFAULT_CASTERS;
            }
        });
    }

    private normalizeNames<
        T extends object
    >(arr: (T & MaybeTranslatableNames)[]): (T & { names: TranslatableNames; })[] {
        return arr.map(item => {
            const result = {
                ...item
            } as (T & { names: TranslatableNames; });

            if ('name' in item) {
                result.names = {
                    EN: item.name
                };

                delete (result as Record<string, unknown>).name;
            }

            return result;
        });
    }
}
