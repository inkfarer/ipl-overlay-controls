import type NodeCG from '@nodecg/types';
import { RuntimeConfig } from 'schemas';

export class ActiveBundleService {
    private nodecg: NodeCG.ServerAPI;
    private bundles: NodeCG.ServerReplicant<NodeCG.Bundle[]>;
    private runtimeConfig: NodeCG.ServerReplicant<RuntimeConfig>;

    constructor(nodecg: NodeCG.ServerAPI) {
        this.nodecg = nodecg;
        this.runtimeConfig = nodecg.Replicant('runtimeConfig');
        this.bundles = nodecg.Replicant('bundles', 'nodecg');

        this.bundles.on('change', (newValue) => {
            if (newValue.length === 0) return;

            this.runtimeConfig.value.activeGraphicsBundles = this.runtimeConfig.value.activeGraphicsBundles
                .filter(bundleName => newValue.some(otherBundle =>
                    otherBundle.name !== this.nodecg.bundleName && otherBundle.name === bundleName));

            if (this.runtimeConfig.value.activeGraphicsBundles.length === 0 && newValue.length > 1) {
                const newActiveBundle = newValue.find(bundle => bundle.name !== this.nodecg.bundleName);
                this.nodecg.log.info(`Setting active graphics bundle to "${newActiveBundle.name}"`);
                this.runtimeConfig.value.activeGraphicsBundles = [newActiveBundle.name];
            }
        });
    }
}
