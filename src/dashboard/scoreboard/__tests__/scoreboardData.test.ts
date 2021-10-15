import { MockNodecg } from '../../__mocks__/mockNodecg_legacy';
import { dispatch, elementById } from '../../helpers/elemHelper';
import { ScoreboardData } from 'schemas';

describe('scoreboardData', () => {
    let nodecg: MockNodecg;

    beforeEach(() => {
        jest.resetModules();
        jest.resetAllMocks();

        nodecg = new MockNodecg();
        nodecg.init();

        document.body.innerHTML = `
            <button id="show-scoreboard-btn"></button>
            <button id="hide-scoreboard-btn"></button>
            <button id="update-scoreboard-btn"></button>
            <button id="show-casters-btn"></button>
            <input id="flavor-text-input">
        `;

        require('../scoreboardData');
    });

    describe('scoreboardData: change', () => {
        it('updates inputs and toggles', () => {
            nodecg.listeners.scoreboardData({ flavorText: 'Flavor text!', isVisible: true });

            expect(elementById<HTMLInputElement>('flavor-text-input').value).toEqual('Flavor text!');
            expect(elementById<HTMLButtonElement>('hide-scoreboard-btn').disabled).toEqual(false);
            expect(elementById<HTMLButtonElement>('show-scoreboard-btn').disabled).toEqual(true);
        });
    });

    describe('update-scoreboard-btn: click', () => {
        it('updates flavor text', () => {
            elementById<HTMLInputElement>('flavor-text-input').value = 'Fun tournament?';
            nodecg.replicants.scoreboardData.value = { flavorText: '' };

            dispatch(elementById('update-scoreboard-btn'), 'click');

            expect(nodecg.replicants.scoreboardData.value).toEqual({ flavorText: 'Fun tournament?' });
        });
    });

    describe('show-scoreboard-btn: click', () => {
        it('updates scoreboard data', () => {
            nodecg.replicants.scoreboardData.value = { isVisible: undefined };

            dispatch(elementById('show-scoreboard-btn'), 'click');

            expect((nodecg.replicants.scoreboardData.value as ScoreboardData).isVisible).toEqual(true);
        });
    });

    describe('hide-scoreboard-btn: click', () => {
        it('updates scoreboard data', () => {
            nodecg.replicants.scoreboardData.value = { isVisible: undefined };

            dispatch(elementById('hide-scoreboard-btn'), 'click');

            expect((nodecg.replicants.scoreboardData.value as ScoreboardData).isVisible).toEqual(false);
        });
    });

    describe('show-casters-btn: click', () => {
        it('sends a message', () => {
            dispatch(elementById('show-casters-btn'), 'click');

            expect(nodecg.sendMessage).toHaveBeenCalledWith('mainShowCasters');
        });
    });
});
