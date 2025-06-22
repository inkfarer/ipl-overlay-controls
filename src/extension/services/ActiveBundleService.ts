import type NodeCG from '@nodecg/types';
import { ActiveBreakScene, RuntimeConfig } from 'schemas';
import { BundleDeclaredConfig } from 'types/schemas/bundleDeclaredConfig';

export class ActiveBundleService {
    private nodecg: NodeCG.ServerAPI;
    private bundles: NodeCG.ServerReplicant<NodeCG.Bundle[]>;
    private runtimeConfig: NodeCG.ServerReplicant<RuntimeConfig>;
    private activeBreakScene: NodeCG.ServerReplicant<ActiveBreakScene>;
    private bundleDeclaredConfig: NodeCG.ServerReplicant<BundleDeclaredConfig>;

    constructor(nodecg: NodeCG.ServerAPI) {
        this.nodecg = nodecg;
        this.runtimeConfig = nodecg.Replicant('runtimeConfig');
        this.bundles = nodecg.Replicant('bundles', 'nodecg');
        this.activeBreakScene = nodecg.Replicant('activeBreakScene');
        this.bundleDeclaredConfig = nodecg.Replicant('bundleDeclaredConfig', { persistent: false });

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

        this.runtimeConfig.on('change', (newValue, oldValue) => {
            if (oldValue == null) return;

            if (
                newValue.activeGraphicsBundles.length !== oldValue.activeGraphicsBundles.length
                || newValue.activeGraphicsBundles.some((bundle, i) => oldValue.activeGraphicsBundles[i] !== bundle)
            ) {
                const allowedBreakScenes = new Set(['main', 'teams', 'stages']);

                newValue.activeGraphicsBundles.forEach(bundle => {
                    const bundleConfig = this.bundleDeclaredConfig.value[bundle];
                    if (bundleConfig != null) {
                        bundleConfig.scenes.forEach(scene => {
                            allowedBreakScenes.add(scene.value);
                        });
                    }
                });

                if (!allowedBreakScenes.has(this.activeBreakScene.value)) {
                    this.activeBreakScene.value = 'main';
                }
            }
        });
    }
}
