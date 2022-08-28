import { mock } from 'jest-mock-extended';
import { mockNodecg } from '../../__mocks__/mockNodecg';
import { AutomationActionService } from '../../services/AutomationActionService';
import { AutomationActionController } from '../AutomationActionController';
import { controllerListeners } from '../../__mocks__/MockBaseController';
import { GameAutomationAction } from '../../../types/enums/GameAutomationAction';

describe('AutomationActionController', () => {
    let automationActionService: AutomationActionService;

    beforeEach(() => {
        automationActionService = mock<AutomationActionService>();
        new AutomationActionController(mockNodecg, automationActionService);
    });

    describe('startGame', () => {
        it('starts a new game', () => {
            controllerListeners.startGame();

            expect(automationActionService.startAutomationAction).toHaveBeenCalledWith(GameAutomationAction.START_GAME);
        });
    });

    describe('endGame', () => {
        it('ends the current game', () => {
            controllerListeners.endGame();

            expect(automationActionService.startAutomationAction).toHaveBeenCalledWith(GameAutomationAction.END_GAME);
        });
    });

    describe('fastForwardToNextGameAutomationTask', () => {
        it('fast forwards to the next automation task', () => {
            controllerListeners.fastForwardToNextGameAutomationTask();

            expect(automationActionService.fastForwardToNextAutomationTask).toHaveBeenCalled();
        });
    });

    describe('cancelAutomationAction', () => {
        it('cancels the ongoing automation action', () => {
            controllerListeners.cancelAutomationAction();

            expect(automationActionService.cancelAutomationAction).toHaveBeenCalled();
        });
    });
});
