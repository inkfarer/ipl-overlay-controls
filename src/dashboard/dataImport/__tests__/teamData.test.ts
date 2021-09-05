import { MockNodecg } from '../../__mocks__/mockNodecg';
import { dispatch, elementById } from '../../helpers/elemHelper';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';

describe('something', () => {
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
            <select id="method-selector">
                <option value="BATTLEFY"></option>
                <option value="SMASHGG"></option>
                <option value="UPLOAD"></option>
            </select>
            <button id="submit-import"></button>
            <input id="team-web-import-toggle">
            <input id="tournament-id-input">
            <div id="tournament-name"></div>
            <div id="tournament-id"></div>
            <div id="team-data-submit-status"></div>
            <div id="team-web-import-toggle-container"></div>
            <div id="local-team-input-wrapper"></div>
            <div id="web-tournament-import-wrapper"></div>
            <div id="tournament-id-input-title"></div>`;

        require('../teamData');
    });

    describe('method-selector: change', () => {
        it('updates input label if method is BATTLEFY', () => {
            const selector = elementById<HTMLSelectElement>('method-selector');
            selector.value = 'BATTLEFY';

            dispatch(selector, 'change');

            expect(elementById('tournament-id-input-title').innerText).toEqual('Tournament ID');
        });

        it('updates input label if method is SMASHGG', () => {
            const selector = elementById<HTMLSelectElement>('method-selector');
            selector.value = 'SMASHGG';

            dispatch(selector, 'change');

            expect(elementById('tournament-id-input-title').innerText).toEqual('Tournament Slug');
        });

        it('updates input label if method is UPLOAD', () => {
            const selector = elementById<HTMLSelectElement>('method-selector');
            selector.value = 'UPLOAD';

            dispatch(selector, 'change');

            expect(elementById('tournament-id-input-title').innerText).toEqual('Data URL');
        });

        it('displays appropriate elements if method is UPLOAD and web import is enabled', () => {
            elementById<HTMLInputElement>('team-web-import-toggle').checked = true;
            const selector = elementById<HTMLSelectElement>('method-selector');
            selector.value = 'UPLOAD';

            dispatch(selector, 'change');

            expect(elementById('team-web-import-toggle-container').style.display).toEqual('');
            expect(elementById('local-team-input-wrapper').style.display).toEqual('');
            expect(elementById('web-tournament-import-wrapper').style.display).toEqual('');
        });

        it('displays appropriate elements if method is UPLOAD and web import is disabled', () => {
            elementById<HTMLInputElement>('team-web-import-toggle').checked = false;
            const selector = elementById<HTMLSelectElement>('method-selector');
            selector.value = 'UPLOAD';

            dispatch(selector, 'change');

            expect(elementById('team-web-import-toggle-container').style.display).toEqual('');
            expect(elementById('local-team-input-wrapper').style.display).toEqual('');
            expect(elementById('web-tournament-import-wrapper').style.display).toEqual('none');
        });

        it('displays appropriate elements if method is not UPLOAD', () => {
            const selector = elementById<HTMLSelectElement>('method-selector');
            selector.value = 'BATTLEFY';

            dispatch(selector, 'change');

            expect(elementById('team-web-import-toggle-container').style.display).toEqual('none');
            expect(elementById('local-team-input-wrapper').style.display).toEqual('none');
            expect(elementById('web-tournament-import-wrapper').style.display).toEqual('');
        });
    });

    describe('submit-import: click', () => {
        it('sends a message', () => {
            elementById<HTMLSelectElement>('method-selector').value = 'SMASHGG';
            elementById<HTMLInputElement>('tournament-id-input').value = 'tourney123123';

            dispatch(elementById('submit-import'), 'click');

            expect(nodecg.sendMessage).toHaveBeenCalledWith('getTournamentData', {
                method: 'SMASHGG',
                id: 'tourney123123'
            }, expect.any(Function));
        });

        it('sends a message if uploading data from URL', () => {
            elementById<HTMLSelectElement>('method-selector').value = 'UPLOAD';
            elementById<HTMLInputElement>('tournament-id-input').value = 'tourney://tourney123123';
            elementById<HTMLInputElement>('team-web-import-toggle').checked = true;

            dispatch(elementById('submit-import'), 'click');

            expect(nodecg.sendMessage).toHaveBeenCalledWith('getTournamentData', {
                method: 'UPLOAD',
                id: 'tourney://tourney123123'
            }, expect.any(Function));
        });

        it('uploads file if uploading data from file', () => {
            elementById<HTMLSelectElement>('method-selector').value = 'UPLOAD';
            elementById<HTMLInputElement>('team-web-import-toggle').checked = false;

            dispatch(elementById('submit-import'), 'click');

            expect(mockPostData.sendLocalFile).toHaveBeenCalledWith('teams',
                elementById('team-input-file-input'), elementById('team-data-submit-status'));
        });
    });

    describe('team-web-import-toggle: click', () => {
        it('displays appropriate elements if checked', () => {
            const toggle = elementById<HTMLInputElement>('team-web-import-toggle');
            toggle.checked = true;
            dispatch(toggle, 'click');

            expect(elementById('local-team-input-wrapper').style.display).toEqual('none');
            expect(elementById('web-tournament-import-wrapper').style.display).toEqual('');
        });

        it('displays appropriate elements if not checked', () => {
            const toggle = elementById<HTMLInputElement>('team-web-import-toggle');
            toggle.checked = false;
            dispatch(toggle, 'click');

            expect(elementById('local-team-input-wrapper').style.display).toEqual('');
            expect(elementById('web-tournament-import-wrapper').style.display).toEqual('none');
        });
    });

    describe('tournamentData: change', () => {
        it('updates data display', () => {
            nodecg.listeners.tournamentData({
                meta: {
                    name: 'Cool Tournament',
                    source: TournamentDataSource.SMASHGG,
                    id: '123123'
                }
            });

            expect(elementById('tournament-name').innerText).toEqual('Cool Tournament');
            expect(elementById('tournament-id').innerText).toEqual('123123 (Smash.gg)');
        });

        it('handles missing tournament name', () => {
            nodecg.listeners.tournamentData({
                meta: {
                    name: undefined,
                    source: TournamentDataSource.BATTLEFY,
                    id: '567567a'
                }
            });

            expect(elementById('tournament-name').innerText).toEqual('No Name');
            expect(elementById('tournament-id').innerText).toEqual('567567a (Battlefy)');
        });
    });
});
