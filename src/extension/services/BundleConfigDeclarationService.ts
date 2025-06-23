import type NodeCG from '@nodecg/types';
import { BundleDeclaredConfig } from 'types/schemas/bundleDeclaredConfig';
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

export class BundleConfigDeclarationService {
    private bundleDeclaredConfig: NodeCG.ServerReplicant<BundleDeclaredConfig>;
    private bundleCasterSets: NodeCG.ServerReplicant<BundleCasterSets>;

    constructor(nodecg: NodeCG.ServerAPI) {
        this.bundleDeclaredConfig = nodecg.Replicant('bundleDeclaredConfig', { persistent: false });
        this.bundleCasterSets = nodecg.Replicant('bundleCasterSets');
    }

    declareCustomScenes(bundleName: string, scenes: BundleDeclaredConfig[string]['scenes']) {
        if (this.bundleDeclaredConfig.value[bundleName]) {
            this.bundleDeclaredConfig.value[bundleName].scenes = scenes;
        } else {
            this.bundleDeclaredConfig.value[bundleName] = { scenes };
        }
    }

    declareCasterSets(bundleName: string, casterSets: BundleDeclaredConfig[string]['casterSets']) {
        if (this.bundleDeclaredConfig.value[bundleName]) {
            this.bundleDeclaredConfig.value[bundleName].casterSets = casterSets;
        } else {
            this.bundleDeclaredConfig.value[bundleName] = { casterSets };
        }

        if (this.bundleCasterSets.value[bundleName] == null) {
            this.bundleCasterSets.value[bundleName] = {};
        }
        casterSets.forEach(casterSet => {
            if (this.bundleCasterSets.value[bundleName][casterSet.key] == null) {
                this.bundleCasterSets.value[bundleName][casterSet.key] = DEFAULT_CASTERS;
            }
        });
    }
}
