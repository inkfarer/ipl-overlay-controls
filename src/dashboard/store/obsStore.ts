import { GameAutomationData, ObsCredentials, ObsData } from 'schemas';
import { defineStore } from 'pinia';

const obsData = nodecg.Replicant<ObsData>('obsData');
const obsCredentials = nodecg.Replicant<ObsCredentials>('obsCredentials');
const gameAutomationData = nodecg.Replicant<GameAutomationData>('gameAutomationData');

export const obsReps = [obsData, obsCredentials, gameAutomationData];

export interface ObsStore {
    obsData: ObsData
    obsCredentials: ObsCredentials
    gameAutomationData: GameAutomationData
}

export const useObsStore = defineStore('obs', {
    state: () => ({
        obsData: null,
        obsCredentials: null,
        gameAutomationData: null
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
    }
});
