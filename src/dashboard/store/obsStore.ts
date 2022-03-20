import { NodeCGBrowser } from 'nodecg/browser';
import { ObsCredentials, ObsData } from 'schemas';
import { SetObsDataRequest } from 'types/messages/obs';
import { defineStore } from 'pinia';

const obsData = nodecg.Replicant<ObsData>('obsData');
const obsCredentials = nodecg.Replicant<ObsCredentials>('obsCredentials');

export const obsReps = [obsData, obsCredentials];

export interface ObsStore {
    obsData: ObsData
    obsCredentials: ObsCredentials
}

export const useObsStore = defineStore('obs', {
    state: () => ({
        obsData: null,
        obsCredentials: null
    } as ObsStore),
    actions: {
        async connect({ address, password }: { address: string, password?: string }): Promise<void> {
            return nodecg.sendMessage('connectToObs', { address, password });
        },
        async setData(data: SetObsDataRequest): Promise<void> {
            return nodecg.sendMessage('setObsData', data);
        },
        async startGame(): Promise<void> {
            return nodecg.sendMessage('startGame');
        },
        async endGame(): Promise<void> {
            return nodecg.sendMessage('endGame');
        },
        setEnabled(enabled: boolean): void {
            nodecg.sendMessage('setObsSocketEnabled', enabled);
        }
    }
});
