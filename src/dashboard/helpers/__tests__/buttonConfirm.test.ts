import { dispatch } from '../elemHelper';
import Mock = jest.Mock;
import { UnknownFunction } from '../../../helpers/__mocks__/module';

describe('buttonConfirm', () => {
    beforeEach(() => {
        require('../buttonConfirm');
    });

    it('adds event listeners to appropriate buttons on page load', () => {
        const confirmationButton = button();
        jest.spyOn(document, 'querySelectorAll')
            .mockReturnValue([confirmationButton] as unknown as NodeListOf<HTMLButtonElement>);

        dispatch(window, 'DOMContentLoaded');

        expect(confirmationButton.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
        expect(document.querySelectorAll).toHaveBeenCalledWith('button[data-requires-confirmation]');
    });

    it('changes button attributes on click', () => {
        const confirmationButton = button();
        confirmationButton.innerText = 'Button!';

        dispatch(window, 'DOMContentLoaded');
        dispatch(confirmationButton, 'click');

        expect(confirmationButton.dataset.isClicked).toEqual('true');
        expect(confirmationButton.dataset.originalText).toEqual('Button!');
        expect(confirmationButton.innerText).toEqual('are you sure?');
    });

    it('resets button attributes after a timeout', () => {
        jest.useFakeTimers();
        const confirmationButton = button();
        confirmationButton.innerText = 'Button!';

        dispatch(window, 'DOMContentLoaded');
        dispatch(confirmationButton, 'click');

        expect(confirmationButton.dataset.isClicked).toEqual('true');
        expect(confirmationButton.dataset.originalText).toEqual('Button!');
        expect(confirmationButton.innerText).toEqual('are you sure?');

        jest.runOnlyPendingTimers();

        expect(confirmationButton.dataset.isClicked).toEqual('false');
        expect(confirmationButton.innerText).toEqual('Button!');
        expect(confirmationButton.dispatchEvent).toHaveBeenCalledTimes(1);
        expect((confirmationButton.dispatchEvent as Mock).mock.calls[0][0].type).toEqual('click');
    });

    it('resets button attributes and dispatches an event after a second click', () => {
        jest.useFakeTimers();
        const confirmationButton = button();
        confirmationButton.innerText = 'Button!';

        dispatch(window, 'DOMContentLoaded');
        dispatch(confirmationButton, 'click');

        expect(confirmationButton.dataset.isClicked).toEqual('true');
        expect(confirmationButton.dataset.originalText).toEqual('Button!');
        expect(confirmationButton.innerText).toEqual('are you sure?');

        dispatch(confirmationButton, 'click');

        expect(confirmationButton.dataset.isClicked).toEqual('false');
        expect(confirmationButton.innerText).toEqual('Button!');
        expect(confirmationButton.dispatchEvent).toHaveBeenCalledTimes(3);
        expect((confirmationButton.dispatchEvent as Mock).mock.calls[0][0].type).toEqual('click');
        expect((confirmationButton.dispatchEvent as Mock).mock.calls[1][0].type).toEqual('click');
        expect((confirmationButton.dispatchEvent as Mock).mock.calls[2][0].type).toEqual('confirm');
    });

    it('creates a mutation observer that adds event listeners to added nodes', () => {
        let mutationObserverCallback: UnknownFunction;
        // @ts-ignore: just a test
        global.MutationObserver = class {
            constructor(callback: UnknownFunction) {
                mutationObserverCallback = callback;
            }
            observe = jest.fn();
        };
        const btn = button();
        btn.dataset.requiresConfirmation = 'true';

        dispatch(window, 'DOMContentLoaded');

        if (!mutationObserverCallback) {
            fail('No mutation observer exists.');
        } else {
            mutationObserverCallback([
                { addedNodes: [ btn ]}
            ]);
        }

        expect(btn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });

    function button(): HTMLButtonElement {
        const result = document.createElement('button');
        jest.spyOn(result, 'addEventListener');
        jest.spyOn(result, 'dispatchEvent');
        jest.spyOn(document, 'querySelectorAll')
            .mockReturnValue([result] as unknown as NodeListOf<HTMLButtonElement>);
        return result;
    }
});
