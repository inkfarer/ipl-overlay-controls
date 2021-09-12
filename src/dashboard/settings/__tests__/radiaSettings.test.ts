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
            <input id="auto-tournament-data-update-toggle">
            <button id="update-radia-data-btn"></button>`;
        require('../radiaSettings');
    });

    describe('radiaSettings: change', () => {
        it('updates inputs', () => {
            const updateOnImportToggle = elementById<HTMLInputElement>('auto-tournament-data-update-toggle');
            updateOnImportToggle.checked = false;
            nodecg.listeners.radiaSettings({ guildID: 'new1239047819804', updateOnImport: true });

            expect(elementById<HTMLInputElement>('radia-guild-input').value)
                .toBe('new1239047819804');
            expect(updateOnImportToggle.checked).toEqual(true);
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

    describe('auto-tournament-data-update-toggle: change', () => {
        it('updates replicant value', () => {
            nodecg.replicants.radiaSettings.value = { updateOnImport: false };
            const toggle = elementById<HTMLInputElement>('auto-tournament-data-update-toggle');
            toggle.checked = true;

            dispatch(toggle, 'change');

            expect((nodecg.replicants.radiaSettings.value as RadiaSettings).updateOnImport).toEqual(true);
        });
    });
});
