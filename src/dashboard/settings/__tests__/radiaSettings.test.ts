import { RadiaSettings } from 'schemas';
import { MockNodecg } from '../../__mocks__/mockNodecg';
import { dispatch, elementById } from '../../helpers/elemHelper';

describe('lastFmSettings', () => {
    let nodecg: MockNodecg;

    beforeEach(() => {
        jest.resetModules();
        nodecg = new MockNodecg();
        nodecg.init();

        document.body.innerHTML = `
            <input id="radia-guild-input">
            <button id="update-radia-data-btn"></button>`;
        require('../radiaSettings');
    });

    describe('radiaSettings replicant change', () => {
        it('updates input', () => {
            nodecg.listeners.radiaSettings({ guildID: 'new1239047819804' });

            expect(elementById<HTMLInputElement>('radia-guild-input').value)
                .toBe('new1239047819804');
        });
    });

    describe('lastfm data update button click', () => {
        it('updates replicant value', () => {
            nodecg.replicants.radiaSettings.value = { guildID: 'OLD123123' };
            elementById<HTMLInputElement>('radia-guild-input').value = 'NEW324345';

            dispatch(elementById('update-radia-data-btn'), 'click');

            expect((nodecg.replicants.radiaSettings.value as RadiaSettings).guildID).toBe('NEW324345');
        });
    });
});
