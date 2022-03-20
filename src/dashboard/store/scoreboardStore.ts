import { NodeCGBrowser } from 'nodecg/browser';
import { ScoreboardData } from 'schemas';
import { defineStore } from 'pinia';

const scoreboardData = nodecg.Replicant<ScoreboardData>('scoreboardData');

export const scoreboardReps = [scoreboardData];

export interface ScoreboardStore {
    scoreboardData: ScoreboardData
}

export const useScoreboardStore = defineStore('scoreboard', {
    state: () => ({
        scoreboardData: {
            flavorText: '',
            isVisible: null
        }
    } as ScoreboardStore),
    actions: {
        setFlavorText(flavorText: string): void {
            scoreboardData.value.flavorText = flavorText;
        },
        setScoreboardVisible(isVisible: boolean): void {
            scoreboardData.value.isVisible = isVisible;
        }
    }
});
