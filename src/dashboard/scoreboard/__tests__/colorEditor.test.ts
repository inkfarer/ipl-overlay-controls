import { MockNodecg } from '../../__mocks__/mockNodecg';
import { dispatch, elementById } from '../../helpers/elemHelper';

describe('colorEditor', () => {
    let nodecg: MockNodecg;

    beforeEach(() => {
        jest.resetModules();
        jest.resetAllMocks();

        nodecg = new MockNodecg();
        nodecg.init();

        document.body.innerHTML = `
            <select id="color-selector"></select>
            <input id="custom-color-toggle">
            <input id="team-a-custom-color">
            <input id="team-b-custom-color">
            <button id="swap-color-order-btn"></button>
            <button id="update-scoreboard-btn"></button>
            <div id="team-a-color-display"></div>
            <div id="team-b-color-display"></div>
            <div id="color-select-container"></div>
            <div id="custom-color-select-container"></div>
        `;

        require('../colorEditor');
    });

    it('fills color selector with options', () => {
        expect(elementById('color-selector').innerHTML).toMatchSnapshot();
    });

    describe('activeRound: change', () => {
        it('updates data displays', () => {
            nodecg.listeners.activeRound({
                activeColor: {
                    index: 1,
                    categoryName: 'Ranked Modes'
                },
                teamA: { color: '#123123' },
                teamB: { color: '#FFFFFF' }
            });

            expect(elementById<HTMLSelectElement>('color-selector').value).toEqual('ranked-modes_1');
            expect(elementById('team-a-color-display').style.backgroundColor).toEqual('rgb(18, 49, 35)');
            expect(elementById('team-b-color-display').style.backgroundColor).toEqual('rgb(255, 255, 255)');
            expect(elementById<HTMLInputElement>('team-a-custom-color').value).toEqual('#123123');
            expect(elementById<HTMLInputElement>('team-b-custom-color').value).toEqual('#FFFFFF');
            expect(elementById<HTMLInputElement>('custom-color-toggle').checked).toEqual(false);
        });

        it('updates data displays if a custom color is given', () => {
            nodecg.listeners.activeRound({
                activeColor: {
                    index: 999,
                    categoryName: 'Custom Color'
                },
                teamA: { color: '#123123' },
                teamB: { color: '#FFFFFF' }
            });

            expect(elementById<HTMLSelectElement>('color-selector').value).toEqual('custom-color_999');
            expect(elementById('team-a-color-display').style.backgroundColor).toEqual('rgb(18, 49, 35)');
            expect(elementById('team-b-color-display').style.backgroundColor).toEqual('rgb(255, 255, 255)');
            expect(elementById<HTMLInputElement>('team-a-custom-color').value).toEqual('#123123');
            expect(elementById<HTMLInputElement>('team-b-custom-color').value).toEqual('#FFFFFF');
            expect(elementById<HTMLInputElement>('custom-color-toggle').checked).toEqual(true);
            expect(elementById('color-select-container').style.display).toEqual('none');
            expect(elementById('custom-color-select-container').style.display).toEqual('flex');
        });
    });

    describe('custom-color-toggle: change', () => {
        it('displays custom color container when checked', () => {
            const toggle = elementById<HTMLInputElement>('custom-color-toggle');
            toggle.checked = true;

            dispatch(toggle, 'change');

            expect(elementById('color-select-container').style.display).toEqual('none');
            expect(elementById('custom-color-select-container').style.display).toEqual('flex');
        });

        it('hides custom color container when unchecked', () => {
            const toggle = elementById<HTMLInputElement>('custom-color-toggle');
            toggle.checked = false;

            dispatch(toggle, 'change');

            expect(elementById('color-select-container').style.display).toEqual('unset');
            expect(elementById('custom-color-select-container').style.display).toEqual('none');
        });
    });

    describe('swap-color-order-btn: click', () => {
        it('toggles swapColorsInternally value', () => {
            const button = elementById('swap-color-order-btn');
            nodecg.replicants.swapColorsInternally.value = true;

            dispatch(button, 'click');
            expect(nodecg.replicants.swapColorsInternally.value).toEqual(false);

            dispatch(button, 'click');
            expect(nodecg.replicants.swapColorsInternally.value).toEqual(true);
        });
    });

    describe('update-scoreboard-btn: click', () => {
        it('sends message to update color', () => {
            elementById<HTMLSelectElement>('color-selector').value = 'ranked-modes_1';

            dispatch(elementById('update-scoreboard-btn'), 'click');

            expect(nodecg.sendMessage).toHaveBeenCalledWith('setActiveColor', {
                color: {
                    index: 1,
                    title: 'Green vs Magenta',
                    clrA: '#04D976',
                    clrB: '#D600AB'
                },
                categoryName: 'Ranked Modes'
            });
        });

        it('sends message to update color if color is custom', () => {
            elementById<HTMLSelectElement>('color-selector').value = 'ranked-modes_1';
            elementById<HTMLInputElement>('custom-color-toggle').checked = true;
            elementById<HTMLInputElement>('team-a-custom-color').value = '#123123';
            elementById<HTMLInputElement>('team-b-custom-color').value = '#567567';

            dispatch(elementById('update-scoreboard-btn'), 'click');

            expect(nodecg.sendMessage).toHaveBeenCalledWith('setActiveColor', {
                color: {
                    index: 999,
                    title: 'Custom Color',
                    clrA: '#123123',
                    clrB: '#567567'
                },
                categoryName: 'Custom Color'
            });
        });
    });
});
