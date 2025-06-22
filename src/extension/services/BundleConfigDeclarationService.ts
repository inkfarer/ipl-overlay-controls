import type NodeCG from '@nodecg/types';
import { BundleDeclaredConfig } from 'types/schemas/bundleDeclaredConfig';

export class BundleConfigDeclarationService {
    private bundleDeclaredConfig: NodeCG.ServerReplicant<BundleDeclaredConfig>;

    constructor(nodecg: NodeCG.ServerAPI) {
        this.bundleDeclaredConfig = nodecg.Replicant('bundleDeclaredConfig', { persistent: false });
    }

    declareCustomScenes(bundleName: string, scenes: BundleDeclaredConfig[string]['scenes']) {
        if (this.bundleDeclaredConfig.value[bundleName]) {
            this.bundleDeclaredConfig.value[bundleName].scenes = scenes;
        } else {
            this.bundleDeclaredConfig.value[bundleName] = { scenes };
        }
    }
}
