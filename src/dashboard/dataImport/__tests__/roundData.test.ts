import { MockNodecg } from '../../__mocks__/mockNodecg_legacy';
import { dispatch, elementById } from '../../helpers/elemHelper';

describe('roundData', () => {
    const mockPostData = {
        __esModule: true,
        sendLocalFile: jest.fn()
    };
    let nodecg: MockNodecg;

    jest.mock('../postData', () => mockPostData);

    beforeEach(() => {
        jest.resetModules();
        jest.resetAllMocks();

        nodecg = new MockNodecg();
        nodecg.init();

        document.body.innerHTML = `
            <div id="local-round-input-wrapper"></div>
            <div id="web-file-input-wrapper"></div>
            <input id="round-web-import-toggle">
            <input id="round-input-file-input">
            <input id="round-input-url-input">
            <button id="round-import-submit"></button>
            <div id="round-data-submit-status"></div>`;

        require('../roundData');
    });

    describe('round-import-submit: click', () => {
        it('sends message to fetch round if importing from URL', () => {
            elementById<HTMLInputElement>('round-input-url-input').value = 'tournament://url';
            elementById<HTMLInputElement>('round-web-import-toggle').checked = true;

            dispatch(elementById('round-import-submit'), 'click');

            expect(nodecg.sendMessage)
                .toHaveBeenCalledWith('getRounds', { url: 'tournament://url' }, expect.any(Function));
        });

        it('sends file data if importing from file', () => {
            elementById<HTMLInputElement>('round-web-import-toggle').checked = false;

            dispatch(elementById('round-import-submit'), 'click');

            expect(mockPostData.sendLocalFile).toHaveBeenCalledWith('rounds',
                elementById('round-input-file-input'), elementById('round-data-submit-status'));
        });
    });

    describe('round-web-import-toggle: click', () => {
        it('hides appropriate elements if checked', () => {
            const toggle = elementById<HTMLInputElement>('round-web-import-toggle');
            toggle.checked = true;

            dispatch(toggle, 'click');

            expect(elementById('local-round-input-wrapper').style.display).toEqual('none');
            expect(elementById('web-file-input-wrapper').style.display).toEqual('');
        });

        it('hides appropriate elements if not checked', () => {
            const toggle = elementById<HTMLInputElement>('round-web-import-toggle');
            toggle.checked = false;

            dispatch(toggle, 'click');

            expect(elementById('local-round-input-wrapper').style.display).toEqual('');
            expect(elementById('web-file-input-wrapper').style.display).toEqual('none');
        });
    });
});
