import type NodeCG from '@nodecg/types';
import { BaseController } from './BaseController';
import { ObsConnectorService } from '../services/ObsConnectorService';
import { ObsCredentials, ObsData, SwapColorsInternally } from 'schemas';
import i18next from 'i18next';
import { ScreenshotParserService } from '../services/ScreenshotParserService';
import { setActiveColor } from '../helpers/activeColorHelper';
import { swapColors } from '../../helpers/ColorHelper';

export class ObsConnectorController extends BaseController {
    constructor(
        nodecg: NodeCG.ServerAPI,
        obsConnectorService: ObsConnectorService,
        screenshotParserService: ScreenshotParserService
    ) {
        super(nodecg);

        const obsCredentials = nodecg.Replicant<ObsCredentials>('obsCredentials');
        const obsData = nodecg.Replicant<ObsData>('obsData');
        const swapColorsInternally = nodecg.Replicant<SwapColorsInternally>('swapColorsInternally');

        this.listen('connectToObs', async (data) => {
            obsCredentials.value = data;

            if (!obsData.value.enabled) {
                throw new Error(i18next.t('obs.obsSocketDisabled'));
            }

            obsConnectorService.stopReconnecting();
            await obsConnectorService.connect();
        });

        this.listen('setObsData', data => {
            if (!obsData.value.scenes?.some(scene => scene === data.gameplayScene)
                || !obsData.value.scenes?.some(scene => scene === data.intermissionScene)) {
                throw new Error(i18next.t('obs.sceneNotFound'));
            }
            if (!obsData.value.inputs?.some(input => input.name === data.gameplayInput)) {
                throw new Error(i18next.t('obs.inputNotFound'));
            }

            obsData.value = {
                ...obsData.value,
                gameplayScene: data.gameplayScene,
                gameplayInput: data.gameplayInput,
                intermissionScene: data.intermissionScene
            };
        });

        this.listen('setObsSocketEnabled', async (enabled) => {
            if (enabled == null) {
                throw new Error(i18next.t('invalidArgumentsError'));
            }
            obsData.value.enabled = enabled;
            if (!enabled) {
                await obsConnectorService.disconnect();
            } else {
                await obsConnectorService.connect();
            }
        });

        this.listen('setActiveColorsFromGameplaySource', async () => {
            const gameplayInput = obsData.value.gameplayInput;
            if (gameplayInput == null) {
                throw new Error(i18next.t('obs.missingGameplayInput'));
            }
            const sourceScreenshot = await obsConnectorService.getSourceScreenshot(gameplayInput);
            const colors = await screenshotParserService.sampleTeamColors(sourceScreenshot);
            setActiveColor({
                categoryName: colors.categoryName,
                categoryKey: colors.categoryKey,
                color: swapColorsInternally.value ? swapColors(colors) : colors
            });
        });
    }
}
