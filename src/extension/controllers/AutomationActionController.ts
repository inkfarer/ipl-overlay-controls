import type NodeCG from '@nodecg/types';
import { BaseController } from './BaseController';
import { AutomationActionService } from '../services/AutomationActionService';
import { GameAutomationAction } from 'types/enums/GameAutomationAction';

export class AutomationActionController extends BaseController {
    constructor(nodecg: NodeCG.ServerAPI, automationActionService: AutomationActionService) {
        super(nodecg);

        this.listen('startGame', () => {
            automationActionService.startAutomationAction(GameAutomationAction.START_GAME);
        });

        this.listen('endGame', () => {
            automationActionService.startAutomationAction(GameAutomationAction.END_GAME);
        });

        this.listen('fastForwardToNextGameAutomationTask', async () => {
            await automationActionService.fastForwardToNextAutomationTask();
        });

        this.listen('cancelAutomationAction', () => {
            automationActionService.cancelAutomationAction();
        });
    }
}
