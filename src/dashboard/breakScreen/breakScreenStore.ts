import { ActiveBreakScene, MainFlavorText, NextRoundStartTime } from 'schemas';
import { defineStore } from 'pinia';

const mainFlavorText = nodecg.Replicant<MainFlavorText>('mainFlavorText');
const nextRoundStartTime = nodecg.Replicant<NextRoundStartTime>('nextRoundStartTime');
const activeBreakScene = nodecg.Replicant<ActiveBreakScene>('activeBreakScene');

export const breakScreenReps = [ mainFlavorText, nextRoundStartTime, activeBreakScene ];

export interface BreakScreenStore {
    mainFlavorText: MainFlavorText;
    nextRoundStartTime: NextRoundStartTime;
    activeBreakScene: ActiveBreakScene;
}

export const useBreakScreenStore = defineStore('breakScreen', {
    state: () => ({
        mainFlavorText: null,
        nextRoundStartTime: { startTime: null, isVisible: null },
        activeBreakScene: null
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
