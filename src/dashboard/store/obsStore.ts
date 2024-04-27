import { GameAutomationData, ObsConfig, ObsCredentials, ObsState } from 'schemas';
import { defineStore } from 'pinia';

const obsState = nodecg.Replicant<ObsState>('obsState');
const obsConfig = nodecg.Replicant<ObsConfig>('obsConfig');
const obsCredentials = nodecg.Replicant<ObsCredentials>('obsCredentials');
const gameAutomationData = nodecg.Replicant<GameAutomationData>('gameAutomationData');

export const obsReps = [obsState, obsConfig, obsCredentials, gameAutomationData];

export interface ObsStore {
    obsState: ObsState
    obsConfig: ObsConfig
    obsCredentials: ObsCredentials
    gameAutomationData: GameAutomationData
}

export const useObsStore = defineStore('obs', {
    state: () => ({
        obsState: null,
        obsCredentials: null,
        gameAutomationData: null,
        obsConfig: []
    } as ObsStore),
    actions: {
        async connect({ address, password }: { address: string, password?: string }): Promise<void> {
            return nodecg.sendMessage('connectToObs', { address, password });
        },
        async startGame(): Promise<void> {
            return nodecg.sendMessage('startGame');
        },
        async endGame(): Promise<void> {
            return nodecg.sendMessage('endGame');
        },
        async fastForwardToNextGameAutomationTask(): Promise<void> {
            return nodecg.sendMessage('fastForwardToNextGameAutomationTask');
        },
        setEnabled(enabled: boolean): Promise<void> {
            return nodecg.sendMessage('setObsSocketEnabled', enabled);
        }
    },
    getters: {
        currentConfig: state => {
            const currentSceneCollection = state.obsState.currentSceneCollection;
            if (currentSceneCollection == null) return undefined;
            return state.obsConfig.find(item => item.sceneCollection === currentSceneCollection);
        }
    }
});
