import { LastFmSettings } from 'schemas';
import { MockNodecg } from '../../__mocks__/mockNodecg';
import { dispatch, elementById } from '../../helpers/elemHelper';

describe('lastFmSettings', () => {
    let nodecg: MockNodecg;

    beforeEach(() => {
        jest.resetModules();
        nodecg = new MockNodecg();
        nodecg.init();

        document.body.innerHTML = `
            <input id="last-fm-username-input">
            <button id="update-lastfm-data-btn"></button>`;
        require('../lastFmSettings');
    });

    describe('lastFmSettings replicant change', () => {
        it('updates input', () => {
            nodecg.listeners['lastFmSettings']({ username: 'new-username' });

            expect(elementById<HTMLInputElement>('last-fm-username-input').value)
                .toBe('new-username');
        });
    });

    describe('lastfm data update button click', () => {
        it('updates replicant value', () => {
            nodecg.replicants.lastFmSettings.value = { username: 'Old Username' };
            elementById<HTMLInputElement>('last-fm-username-input').value = 'New Username';

            dispatch(elementById('update-lastfm-data-btn'), 'click');

            expect((nodecg.replicants.lastFmSettings.value as LastFmSettings).username).toBe('New Username');
        });
    });
});
