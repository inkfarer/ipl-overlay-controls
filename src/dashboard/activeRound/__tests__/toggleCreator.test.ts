import { MockNodecg } from '../../__mocks__/mockNodecg';
import { Module } from '../../../helpers/__mocks__/module';
import { dispatch, elementById } from '../../helpers/elemHelper';
import { GameWinner } from 'types/enums/gameWinner';

describe('toggleCreator', () => {
    const mockToggleHelper = {
        __esModule: true,
        getActiveRoundColors: jest.fn(),
        handleColorSelectorChange: jest.fn(),
        handleColorSwapToggleChange: jest.fn(),
        handleCustomColorListenerChange: jest.fn(),
        setToggleColor: jest.fn(),
        toggleCustomColorSelectorVisibility: jest.fn()
    };
    let nodecg: MockNodecg;
    let helper: Module;

    jest.mock('../main', () => ({
        __esModule: true,
        enableColorEditToggle: document.createElement('input')
    }));
    jest.mock('../toggleHelper', () => mockToggleHelper);

    beforeEach(() => {
        jest.resetModules();
        jest.resetAllMocks();

        nodecg = new MockNodecg();
        nodecg.init();

        document.body.innerHTML = `
            <input id="enable-color-edit-toggle">
            <button id="update-round">
            <div id="toggles" />`;

        helper = require('../toggleCreator');
    });

    describe('addToggle', () => {
        const setupWithColorData = () => {
            helper.addToggle({
                color: {
                    clrA: '#123',
                    clrB: '#aaa',
                    index: 1,
                    categoryName: 'Cool Color',
                    colorsSwapped: false
                },
                stage: 'Blackbelly Skatepark',
                mode: 'Splat Zones'
            }, 0);
        };

        it('creates toggles when the round has color data', () => {
            helper.addToggle({
                color: {
                    clrA: '#123',
                    clrB: '#aaa',
                    index: 1,
                    categoryName: 'Cool Color',
                    colorsSwapped: false
                },
                stage: 'Blackbelly Skatepark',
                mode: 'Splat Zones'
            }, 0);

            expect(elementById('toggles').innerHTML).toMatchSnapshot();
        });

        it('creates toggles when the round has no color data', () => {
            mockToggleHelper.getActiveRoundColors.mockReturnValue({
                activeColor: {
                    index: 2,
                    categoryName: 'Cool Color (Active)'
                },
                teamA: { color: '#456' },
                teamB: { color: '#EEE' }
            });

            helper.addToggle({
                color: undefined,
                stage: 'MakoMart',
                mode: 'Rainmaker'
            }, 0);

            expect(elementById('toggles').innerHTML).toMatchSnapshot();
        });

        it('creates event listeners for custom color selectors', () => {
            setupWithColorData();

            dispatch(elementById('custom-color-selector_a_0'), 'change');
            dispatch(elementById('custom-color-selector_b_0'), 'change');

            expect(mockToggleHelper.handleCustomColorListenerChange).toHaveBeenCalledTimes(2);
        });

        it('creates event listeners for color selectors', () => {
            setupWithColorData();

            dispatch(elementById('color-selector_0'), 'change');

            expect(mockToggleHelper.handleColorSelectorChange).toHaveBeenCalled();
        });

        it('creates event listeners for color swap toggles', () => {
            setupWithColorData();

            dispatch(elementById('color-swap-toggle_0'), 'change');

            expect(mockToggleHelper.handleColorSwapToggleChange).toHaveBeenCalled();
        });

        it('creates event listeners for custom color toggles', () => {
            setupWithColorData();

            dispatch(elementById('custom-color-toggle_0'), 'change');

            expect(mockToggleHelper.toggleCustomColorSelectorVisibility).toHaveBeenCalled();
        });

        it('creates event listeners for win buttons', () => {
            setupWithColorData();

            dispatch(elementById('no-win-toggle_0'), 'click');
            dispatch(elementById('team-a-win-toggle_0'), 'click');
            dispatch(elementById('team-b-win-toggle_0'), 'click');

            expect(nodecg.sendMessage).toHaveBeenNthCalledWith(1, 'setWinner',
                { winner: GameWinner.NO_WINNER, roundIndex: 0 });
            expect(nodecg.sendMessage).toHaveBeenNthCalledWith(2, 'setWinner',
                { winner: GameWinner.ALPHA, roundIndex: 0 });
            expect(nodecg.sendMessage).toHaveBeenNthCalledWith(3, 'setWinner',
                { winner: GameWinner.BRAVO, roundIndex: 0 });
        });
    });
});
