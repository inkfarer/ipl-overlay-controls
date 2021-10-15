import { MockNodecg } from '../../__mocks__/mockNodecg_legacy';
import { dispatch, elementById } from '../../helpers/elemHelper';

describe('createPredictionDialog', () => {
    let nodecg: MockNodecg;

    beforeEach(() => {
        jest.resetModules();
        jest.resetAllMocks();

        nodecg = new MockNodecg();
        nodecg.init();

        document.body.innerHTML = `
            <div id="warning-message">
                <div id="message"></div>
            </div>
            <div id="prediction-create-status"></div>
            <label for="prediction-option-a-input"></label>
            <input id="prediction-option-a-input" value="Option A">
            <label for="prediction-option-b-input"></label>
            <input id="prediction-option-b-input" value="Option B">
            <label for="prediction-name-input"></label>
            <input id="prediction-name-input" value="Who will win?">
            <button id="create-predictions-btn"></button>
            <label for="prediction-window-input"></label>
            <input id="prediction-window-input" value="120">`;

        require('../createPredictionDialog');
    });

    describe('predction-window-input: input', () => {
        it('sets style if it is below 1', () => {
            const createPredictionButton = elementById<HTMLButtonElement>('create-predictions-btn');
            const input = elementById<HTMLInputElement>('prediction-window-input');
            const warningMessage = elementById('warning-message');
            const warningMessageText = elementById('message');
            input.value = '-10';

            dispatch(input, 'input');

            expect(input.style.color).toEqual('red');
            expect(createPredictionButton.disabled).toEqual(true);
            expect(warningMessageText.innerText).toEqual('Prediction Window must be between 1 - 1800 seconds');
            expect(warningMessage.style.display).toEqual('');
        });

        it('sets style if it is above 1800', () => {
            const createPredictionButton = elementById<HTMLButtonElement>('create-predictions-btn');
            const input = elementById<HTMLInputElement>('prediction-window-input');
            const warningMessage = elementById('warning-message');
            const warningMessageText = elementById('message');
            input.value = '20000';

            dispatch(input, 'input');

            expect(input.style.color).toEqual('red');
            expect(createPredictionButton.disabled).toEqual(true);
            expect(warningMessageText.innerText).toEqual('Prediction Window must be between 1 - 1800 seconds');
            expect(warningMessage.style.display).toEqual('');
        });

        it('sets style if it is not a number', () => {
            const createPredictionButton = elementById<HTMLButtonElement>('create-predictions-btn');
            const input = elementById<HTMLInputElement>('prediction-window-input');
            const warningMessage = elementById('warning-message');
            const warningMessageText = elementById('message');
            input.value = 'textetxt';

            dispatch(input, 'input');

            expect(input.style.color).toEqual('red');
            expect(createPredictionButton.disabled).toEqual(true);
            expect(warningMessageText.innerText).toEqual('Prediction Window must be between 1 - 1800 seconds');
            expect(warningMessage.style.display).toEqual('');
        });

        it('sets style if it is valid', () => {
            const createPredictionButton = elementById<HTMLButtonElement>('create-predictions-btn');
            const input = elementById<HTMLInputElement>('prediction-window-input');
            const warningMessage = elementById('warning-message');
            input.value = '180';

            dispatch(input, 'input');

            expect(input.style.color).toEqual('white');
            expect(createPredictionButton.disabled).toEqual(false);
            expect(warningMessage.style.display).toEqual('none');
        });
    });

    describe('create-predictions-btn: click', () => {
        it('sends message with data', () => {
            const button = elementById('create-predictions-btn');

            dispatch(button, 'click');

            expect(nodecg.sendMessage).toHaveBeenCalledWith('postPrediction', {
                title: 'Who will win?',
                outcomes: [
                    { title: 'Option A' },
                    { title: 'Option B' }
                ],
                prediction_window: '120'
            }, expect.any(Function));
        });

        it('handles error on callback', () => {
            const button = elementById('create-predictions-btn');
            const warningMessage = elementById('warning-message');
            const warningMessageText = elementById('message');
            const error = { message: 'Something bad has happened.' };
            console.error = jest.fn();

            dispatch(button, 'click');
            const callback = nodecg.sendMessage.mock.calls[0][2];
            callback(error);

            expect(warningMessageText.innerText).toEqual(error.message);
            expect(warningMessage.style.display).toEqual('');
            expect(console.error).toHaveBeenCalledWith(error);
        });
    });

    describe('nextRound: change', () => {
        it('changes input values', () => {
            nodecg.listeners.nextRound({
                teamA: { name: 'long name long name long name long name' },
                teamB: { name: 'short name' }
            });

            expect(elementById<HTMLInputElement>('prediction-option-a-input').value)
                .toEqual('long name long name lo...');
            expect(elementById<HTMLInputElement>('prediction-option-b-input').value).toEqual('short name');
        });
    });
});
