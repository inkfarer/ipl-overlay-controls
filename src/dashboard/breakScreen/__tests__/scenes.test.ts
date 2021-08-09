import { MockNodecg } from '../../__mocks__/mockNodecg';
import { dispatch, elementById } from '../../helpers/elemHelper';

describe('scenes', () => {
    let nodecg: MockNodecg;

    beforeEach(() => {
        jest.resetModules();

        nodecg = new MockNodecg();
        nodecg.init();

        document.body.innerHTML = `
            <button id="show-teams-scene-btn">
            <button id="show-stages-scene-btn">
            <button id="show-main-scene-btn">`;

        require('../scenes');
    });

    describe('activeBreakScene: change', () => {
        it('disables button if value is main', () => {
            nodecg.listeners.activeBreakScene('main');

            expect(elementById<HTMLButtonElement>('show-main-scene-btn').disabled).toEqual(true);
            expect(elementById<HTMLButtonElement>('show-teams-scene-btn').disabled).toEqual(false);
            expect(elementById<HTMLButtonElement>('show-stages-scene-btn').disabled).toEqual(false);
        });

        it('disables button if value is teams', () => {
            nodecg.listeners.activeBreakScene('teams');

            expect(elementById<HTMLButtonElement>('show-main-scene-btn').disabled).toEqual(false);
            expect(elementById<HTMLButtonElement>('show-teams-scene-btn').disabled).toEqual(true);
            expect(elementById<HTMLButtonElement>('show-stages-scene-btn').disabled).toEqual(false);
        });

        it('disables button if value is stages', () => {
            nodecg.listeners.activeBreakScene('stages');

            expect(elementById<HTMLButtonElement>('show-main-scene-btn').disabled).toEqual(false);
            expect(elementById<HTMLButtonElement>('show-teams-scene-btn').disabled).toEqual(false);
            expect(elementById<HTMLButtonElement>('show-stages-scene-btn').disabled).toEqual(true);
        });
    });

    describe('show-main-scene-btn: click', () => {
        it('updates replicant value', () => {
            dispatch(elementById('show-main-scene-btn'), 'click');

            expect(nodecg.replicants.activeBreakScene.value).toEqual('main');
        });
    });

    describe('show-teams-scene-btn: click', () => {
        it('updates replicant value', () => {
            dispatch(elementById('show-teams-scene-btn'), 'click');

            expect(nodecg.replicants.activeBreakScene.value).toEqual('teams');
        });
    });

    describe('show-stages-scene-btn: click', () => {
        it('updates replicant value', () => {
            dispatch(elementById('show-stages-scene-btn'), 'click');

            expect(nodecg.replicants.activeBreakScene.value).toEqual('stages');
        });
    });
});
