import { MockNodecg } from '../../__mocks__/mockNodecg_legacy';
import { dispatch, elementById } from '../../helpers/elemHelper';
import { UnknownModule } from '../../../helpers/__mocks__/module';
import { WinningOption } from '../types/winningOption';

describe('main', () => {
    const mockResolvePredictionDialog = {
        autoResolveWinner: jest.fn(),
        resolvePrediction: jest.fn(),
        setUI: jest.fn()
    };
    const mockMessageHelper = {
        hideMessage: jest.fn(),
        showMessage: jest.fn()
    };
    let nodecg: MockNodecg;
    let elements: UnknownModule;

    jest.mock('../resolvePredictionDialog', () => mockResolvePredictionDialog);
    jest.mock('../../helpers/messageHelper', () => mockMessageHelper);

    beforeEach(() => {
        jest.resetModules();
        jest.resetAllMocks();

        nodecg = new MockNodecg();
        nodecg.init();

        document.body.innerHTML = `
            <button id="auto-resolve-predictions-btn"></button>
            <button id="resolve-A-predictions-btn"></button>
            <button id="resolve-B-predictions-btn"></button>
        `;

        require('../main_legacy');
        elements = require('../elements');
    });

    describe('predictionStore: change', () => {
        it('resolves winner and updates ui', () => {
            nodecg.replicants.activeRound.value = 'active-round-value';

            nodecg.listeners.predictionStore('prediction-store-value');

            expect(mockResolvePredictionDialog.autoResolveWinner)
                .toHaveBeenCalledWith('active-round-value', 'prediction-store-value');
            expect(mockResolvePredictionDialog.setUI).toHaveBeenCalledWith('prediction-store-value');
        });
    });

    describe('activeRound: change', () => {
        it('resolves winner and updates ui', () => {
            nodecg.replicants.predictionStore.value = 'prediction-store-value';
            const newValue = {
                round: { isCompleted: true }
            };

            nodecg.listeners.activeRound(newValue);

            expect(mockResolvePredictionDialog.autoResolveWinner)
                .toHaveBeenCalledWith(newValue, 'prediction-store-value');
            expect(mockResolvePredictionDialog.setUI).toHaveBeenCalledWith('prediction-store-value');
        });

        it('shows message if round is not completed', () => {
            nodecg.replicants.predictionStore.value = 'prediction-store-value';
            const newValue = {
                round: { isCompleted: false }
            };

            nodecg.listeners.activeRound(newValue);

            expect(mockMessageHelper.showMessage).toHaveBeenCalledWith(
                'round-completed-warning', 'warning', 'The active round has not yet completed!', expect.any(Function));
        });

        it('hides message if round is completed', () => {
            nodecg.replicants.predictionStore.value = 'prediction-store-value';
            const newValue = {
                round: { isCompleted: true }
            };

            nodecg.listeners.activeRound(newValue);

            expect(mockMessageHelper.hideMessage).toHaveBeenCalledWith('round-completed-warning');
        });
    });

    describe('auto-resolve-predictions-btn: click', () => {
        it('resolves prediction with winning option', () => {
            (elements.winningOption as WinningOption).optionIndex = 10;
            dispatch(elementById('auto-resolve-predictions-btn'), 'click');

            expect(mockResolvePredictionDialog.resolvePrediction).toHaveBeenCalledWith(10);
        });
    });

    describe('resolve-A-predictions-btn: click', () => {
        it('resolves prediction with option 0', () => {
            dispatch(elementById('resolve-A-predictions-btn'), 'click');

            expect(mockResolvePredictionDialog.resolvePrediction).toHaveBeenCalledWith(0);
        });
    });

    describe('resolve-B-predictions-btn: click', () => {
        it('resolves prediction with option 1', () => {
            dispatch(elementById('resolve-B-predictions-btn'), 'click');

            expect(mockResolvePredictionDialog.resolvePrediction).toHaveBeenCalledWith(1);
        });
    });
});
