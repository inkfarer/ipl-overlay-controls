import { MockNodecg } from '../../__mocks__/mockNodecg_legacy';
import { dispatch, elementById } from '../../helpers/elemHelper';

describe('colorToggles', () => {
    let nodecg: MockNodecg;

    beforeEach(() => {
        jest.resetModules();
        jest.resetAllMocks();

        nodecg = new MockNodecg();
        nodecg.init();

        document.body.innerHTML = `
            <div id="color-toggle-next">
                <div class="color-toggle-display a"></div>
                <div class="color-toggle-display b"></div>
            </div>
            <div id="color-toggle-prev">
                <div class="color-toggle-display a"></div>
                <div class="color-toggle-display b"></div>
            </div>
        `;

        require('../colorToggles');
    });

    describe('activeRound: change', () => {
        it('disables color toggles if color is custom', () => {
            nodecg.listeners.activeRound({
                activeColor: { categoryName: 'Custom Color', isCustom: true }
            });

            expect(elementById('color-toggle-next').dataset.disabled).toEqual('');
            expect(elementById('color-toggle-prev').dataset.disabled).toEqual('');
        });

        it('enables color toggles and updates data', () => {
            const colorToggleNext = elementById('color-toggle-next');
            const colorTogglePrev = elementById('color-toggle-prev');
            colorToggleNext.dataset.disabled = 'true';
            colorTogglePrev.dataset.disabled = 'true';

            nodecg.listeners.activeRound({ activeColor: { categoryName: 'Ranked Modes', index: 1, isCustom: false } });

            expect(colorToggleNext.dataset.colorInfo).toMatchSnapshot();
            expect(colorToggleNext.innerHTML).toMatchSnapshot();
            expect(colorToggleNext.dataset.categoryName).toEqual('Ranked Modes');
            expect(colorToggleNext.dataset.disabled).toBeUndefined();
            expect(colorTogglePrev.dataset.colorInfo).toMatchSnapshot();
            expect(colorTogglePrev.innerHTML).toMatchSnapshot();
            expect(colorTogglePrev.dataset.categoryName).toEqual('Ranked Modes');
            expect(colorTogglePrev.dataset.disabled).toBeUndefined();
        });

        it('enables color toggles and updates data if colors are swapped', () => {
            const colorToggleNext = elementById('color-toggle-next');
            const colorTogglePrev = elementById('color-toggle-prev');
            colorToggleNext.dataset.disabled = 'true';
            colorTogglePrev.dataset.disabled = 'true';
            nodecg.replicants.swapColorsInternally.value = true;

            nodecg.listeners.activeRound({ activeColor: { categoryName: 'Ranked Modes', index: 1, isCustom: false } });

            expect(colorToggleNext.dataset.colorInfo).toMatchSnapshot();
            expect(colorToggleNext.innerHTML).toMatchSnapshot();
            expect(colorToggleNext.dataset.categoryName).toEqual('Ranked Modes');
            expect(colorToggleNext.dataset.disabled).toBeUndefined();
            expect(colorTogglePrev.dataset.colorInfo).toMatchSnapshot();
            expect(colorTogglePrev.innerHTML).toMatchSnapshot();
            expect(colorTogglePrev.dataset.categoryName).toEqual('Ranked Modes');
            expect(colorTogglePrev.dataset.disabled).toBeUndefined();
        });
    });

    describe('color-toggle-next: click', () => {
        it('sends message to set active color', () => {
            const activeRoundValue = { activeColor: { categoryName: 'Ranked Modes', index: 2, isCustom: false } };
            nodecg.replicants.activeRound.value = activeRoundValue;
            nodecg.listeners.activeRound(activeRoundValue);

            dispatch(elementById('color-toggle-next'), 'click');

            expect(nodecg.sendMessage).toHaveBeenCalledWith('setActiveColor', {
                color: {
                    clrA: '#FF9E03',
                    clrB: '#B909E0',
                    index: 3,
                    title: 'Mustard vs Purple',
                    isCustom: false
                },
                categoryName: 'Ranked Modes'
            });
        });

        it('does not send message if toggle color index is same as active color index', () => {
            const toggle = elementById('color-toggle-next');
            toggle.dataset.colorInfo = JSON.stringify({ index: 2, isCustom: false });
            nodecg.replicants.activeRound.value = {
                activeColor: {
                    categoryName: 'Ranked Modes',
                    index: 2,
                    isCustom: false
                }
            };

            dispatch(toggle, 'click');

            expect(nodecg.sendMessage).not.toHaveBeenCalled();
        });
    });

    describe('color-toggle-prev: click', () => {
        it('sends message to set active color', () => {
            const activeRoundValue = { activeColor: { categoryName: 'Ranked Modes', index: 2, isCustom: false } };
            nodecg.replicants.activeRound.value = activeRoundValue;
            nodecg.listeners.activeRound(activeRoundValue);

            dispatch(elementById('color-toggle-prev'), 'click');

            expect(nodecg.sendMessage).toHaveBeenCalledWith('setActiveColor', {
                color: {
                    clrA: '#04D976',
                    clrB: '#D600AB',
                    index: 1,
                    title: 'Green vs Magenta',
                    isCustom: false
                },
                categoryName: 'Ranked Modes'
            });
        });

        it('does not send message if toggle color index is same as active color index', () => {
            const toggle = elementById('color-toggle-prev');
            toggle.dataset.colorInfo = JSON.stringify({ index: 2, isCustom: false });
            nodecg.replicants.activeRound.value = {
                activeColor: {
                    categoryName: 'Ranked Modes', index: 2, isCustom: false
                }
            };

            dispatch(toggle, 'click');

            expect(nodecg.sendMessage).not.toHaveBeenCalled();
        });
    });
});
