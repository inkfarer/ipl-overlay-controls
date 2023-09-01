import type NodeCG from '@nodecg/types';
import { BaseController } from './BaseController';
import { ObsConnectorService } from '../services/ObsConnectorService';
import { ObsCredentials, ObsData } from 'schemas';

export class ObsConnectorController extends BaseController {
    constructor(nodecg: NodeCG.ServerAPI, obsConnectorService: ObsConnectorService) {
        super(nodecg);

        const obsCredentials = nodecg.Replicant<ObsCredentials>('obsCredentials');
        const obsData = nodecg.Replicant<ObsData>('obsData');

        this.listen('connectToObs', async (data) => {
            obsCredentials.value = data;

            if (!obsData.value.enabled) {
                throw new Error('OBS integration is disabled.');
            }

            obsConnectorService.stopReconnecting();
            await obsConnectorService.connect();
        });

        this.listen('setObsData', data => {
            if (!obsData.value.scenes?.some(scene => scene === data.gameplayScene)
                || !obsData.value.scenes?.some(scene => scene === data.intermissionScene)) {
                throw new Error('Could not find one or more of the provided scenes.');
            }

            obsData.value = {
                ...obsData.value,
                gameplayScene: data.gameplayScene,
                intermissionScene: data.intermissionScene
            };
        });

        this.listen('setObsSocketEnabled', async (enabled) => {
            if (enabled == null) {
                throw new Error('Invalid arguments.');
            }
            obsData.value.enabled = enabled;
            if (!enabled) {
                await obsConnectorService.disconnect();
            } else {
                await obsConnectorService.connect();
            }
        });
    }
}
