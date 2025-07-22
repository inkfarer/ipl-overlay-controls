import { ActiveBreakScene, MainFlavorText, NextRoundStartTime, RuntimeConfig } from 'schemas';
import { defineStore } from 'pinia';
import { BundleDeclaredConfig } from 'types/schemas/bundleDeclaredConfig';

const mainFlavorText = nodecg.Replicant<MainFlavorText>('mainFlavorText');
const nextRoundStartTime = nodecg.Replicant<NextRoundStartTime>('nextRoundStartTime');
const activeBreakScene = nodecg.Replicant<ActiveBreakScene>('activeBreakScene');
const runtimeConfig = nodecg.Replicant<RuntimeConfig>('runtimeConfig');
const bundleDeclaredConfig = nodecg.Replicant<BundleDeclaredConfig>('bundleDeclaredConfig', { persistent: false });

export const breakScreenReps = [
    mainFlavorText,
    nextRoundStartTime,
    activeBreakScene,
    runtimeConfig,
    bundleDeclaredConfig
];

export interface BreakScreenStore {
    mainFlavorText: MainFlavorText;
    nextRoundStartTime: NextRoundStartTime;
    activeBreakScene: ActiveBreakScene;
    runtimeConfig: RuntimeConfig;
    bundleDeclaredConfig: BundleDeclaredConfig;
}

export const useBreakScreenStore = defineStore('breakScreen', {
    state: () => ({
        mainFlavorText: null,
        nextRoundStartTime: { startTime: null, isVisible: null },
        activeBreakScene: null,
        runtimeConfig: null,
        bundleDeclaredConfig: null
    } as BreakScreenStore),
    actions: {
        setActiveBreakScene(newValue: ActiveBreakScene): void {
            activeBreakScene.value = newValue;
        },
        setMainFlavorText(newValue: string): void {
            mainFlavorText.value = newValue;
        },
        setNextRoundStartTimeVisible(newValue: boolean): void {
            nextRoundStartTime.value.isVisible = newValue;
        },
        setNextRoundStartTime(newValue: string): void {
            nextRoundStartTime.value.startTime = newValue;
        }
    }
});
