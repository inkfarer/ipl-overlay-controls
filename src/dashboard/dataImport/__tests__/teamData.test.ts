import { MockNodecg } from '../../__mocks__/mockNodecg_legacy';
import { dispatch, elementById } from '../../helpers/elemHelper';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';

describe('teamData', () => {
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
            <label id="smashgg-event-select-label"></label>
            <select class="smashgg-event-select" id="smashgg-event-select"></select>
            <button id="submit-import"></button>
            <button id="smashgg-event-submit"></button>
            <input id="team-web-import-toggle">
            <input id="tournament-id-input">
            <div id="tournament-name"></div>
            <div id="tournament-id"></div>
            <div id="team-data-submit-status"></div>
            <div id="team-web-import-toggle-container"></div>
            <div id="local-team-input-wrapper"></div>
            <div id="web-tournament-import-wrapper"></div>
            <div id="smashgg-event-select-wrapper"></div>
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
            expect(elementById('smashgg-event-select-wrapper').style.display).toEqual('none');
        });

        it('does not show event selector if method is SMASHGG and there is only one event to select', () => {
            elementById('smashgg-event-select').innerHTML = '<option>Event 1</option>';
            const eventSelectWrapper = elementById('smashgg-event-select-wrapper');
            eventSelectWrapper.style.display = 'none';
            const selector = elementById<HTMLSelectElement>('method-selector');
            selector.value = 'SMASHGG';

            dispatch(selector, 'change');

            expect(eventSelectWrapper.style.display).toEqual('none');
        });

        it('shows event selector if method is SMASHGG and there are events to select', () => {
            elementById('smashgg-event-select').innerHTML = '<option>Event 1</option><option>Event 2</option>';
            const eventSelectWrapper = elementById('smashgg-event-select-wrapper');
            eventSelectWrapper.style.display = 'none';
            const selector = elementById<HTMLSelectElement>('method-selector');
            selector.value = 'SMASHGG';

            dispatch(selector, 'change');

            expect(eventSelectWrapper.style.display).toEqual('');
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
            const messageCallback = nodecg.sendMessage.mock.calls[0][2];
            messageCallback(null, {});
            expect(elementById('smashgg-event-select-wrapper').style.display).toEqual('none');
        });

        it('shows event selector if import returns multiple events', () => {
            elementById<HTMLSelectElement>('method-selector').value = 'SMASHGG';
            elementById<HTMLInputElement>('tournament-id-input').value = 'tourney123123';
            elementById<HTMLSelectElement>('smashgg-event-select').innerHTML = '<option>Cool Event!!</option>';

            dispatch(elementById('submit-import'), 'click');

            expect(nodecg.sendMessage).toHaveBeenCalledWith('getTournamentData', {
                method: 'SMASHGG',
                id: 'tourney123123'
            }, expect.any(Function));

            const messageCallback = nodecg.sendMessage.mock.calls[0][2];
            messageCallback(null, {
                id: 'tourney',
                events: [
                    {
                        id: 123123,
                        name: 'Cool Event',
                        game: 'Splatoon 2'
                    },
                    {
                        id: 324234,
                        name: 'Cool Smash',
                        game: 'Ultimate'
                    }
                ]
            });
            expect(elementById('smashgg-event-select-label').textContent).toEqual('Event (Tournament: tourney)');
            expect(elementById('smashgg-event-select').innerHTML).toMatchSnapshot();
            expect(elementById('smashgg-event-select-wrapper').style.display).toEqual('');
        });

        it('hides event selector if import returns one event', () => {
            elementById<HTMLSelectElement>('method-selector').value = 'SMASHGG';
            elementById<HTMLInputElement>('tournament-id-input').value = 'tourney123123';
            elementById<HTMLSelectElement>('smashgg-event-select').innerHTML = '<option>Cool Event!!</option>';

            dispatch(elementById('submit-import'), 'click');

            expect(nodecg.sendMessage).toHaveBeenCalledWith('getTournamentData', {
                method: 'SMASHGG',
                id: 'tourney123123'
            }, expect.any(Function));

            const messageCallback = nodecg.sendMessage.mock.calls[0][2];
            messageCallback(null, {
                events: [
                    {
                        id: 123123,
                        name: 'Cool Event',
                        game: 'Splatoon 2'
                    }
                ]
            });
            expect(elementById('smashgg-event-select').innerHTML).toEqual('');
            expect(elementById('smashgg-event-select-wrapper').style.display).toEqual('none');
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
        it('updates data display with additional smash.gg data', () => {
            nodecg.listeners.tournamentData({
                meta: {
                    name: 'Cool Tournament',
                    source: TournamentDataSource.SMASHGG,
                    id: '123123',
                    sourceSpecificData: {
                        smashgg: {
                            eventData: {
                                name: 'Cool Event',
                                game: 'Splatoon 2'
                            }
                        }
                    }
                }
            });

            expect(elementById('tournament-name').innerText).toEqual('Cool Tournament');
            expect(elementById('tournament-id').innerText).toEqual('123123 (Smash.gg)\nCool Event (Splatoon 2)');
        });

        it('updates data display', () => {
            nodecg.listeners.tournamentData({
                meta: {
                    name: 'Cool Tournament',
                    source: TournamentDataSource.BATTLEFY,
                    id: '123123'
                }
            });

            expect(elementById('tournament-name').innerText).toEqual('Cool Tournament');
            expect(elementById('tournament-id').innerText).toEqual('123123 (Battlefy)');
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

    describe('smashgg-event-submit: click', () => {
        it('sends a message', () => {
            const eventSelect = elementById<HTMLSelectElement>('smashgg-event-select');
            eventSelect.innerHTML = '<option value="123123">Event 1</option><option value="234243">Event 2</option>';
            eventSelect.value = '234243';

            dispatch(elementById('smashgg-event-submit'), 'click');

            expect(nodecg.sendMessage)
                .toHaveBeenCalledWith('getSmashggEvent', { eventId: 234243 }, expect.any(Function));
        });
    });
});
