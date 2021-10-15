import { MockNodecg } from '../../__mocks__/mockNodecg_legacy';
import { Module } from '../../../helpers/__mocks__/module';
import { GameWinner } from 'types/enums/gameWinner';
import { elementById } from '../../helpers/elemHelper';

describe('toggleUpdater', () => {
    const mockMain = {
        __esModule: true,
        roundNameElem: document.createElement('div')
    };
    const mockToggleHelper = {
        __esModule: true,
        getActiveRoundColors: jest.fn(),
        getWinToggles: jest.fn(),
        toggleCustomColorSelectorVisibility: jest.fn()
    };
    const winButtons = {
        [GameWinner.NO_WINNER]: document.createElement('button'),
        [GameWinner.ALPHA]: document.createElement('button'),
        [GameWinner.BRAVO]: document.createElement('button')
    };
    const mockWinToggleColorHelper = {
        __esModule: true,
        updateWinToggleColors: jest.fn(),
        setWinToggleColor: jest.fn()
    };
    let nodecg: MockNodecg;
    let helper: Module;

    jest.mock('../main_legacy', () => mockMain);
    jest.mock('../toggleHelper', () => mockToggleHelper);
    jest.mock('../winToggleColorHelper', () => mockWinToggleColorHelper);

    beforeEach(() => {
        jest.resetModules();
        jest.resetAllMocks();

        mockToggleHelper.getWinToggles.mockReturnValue(winButtons);

        nodecg = new MockNodecg();
        nodecg.init();

        helper = require('../toggleUpdater');
    });

    describe('updateToggles', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <select id="stage-selector_0">
                    <option selected value="Blackbelly Skatepark" />
                    <option value="MakoMart" />
                </select>
                <select id="mode-selector_0">
                    <option selected value="Splat Zones" />
                    <option value="Rainmaker" />
                </select>
                <div id="game-editor_0">
                    <select class="color-selector">
                        <option selected value="cool-colors_0" />
                        <option value="cool-colors_1 /">
                        <option value="cool-colors_2" />
                        <option value="custom-color_0" />
                    </select>
                    <input class="color-swap-toggle">
                    <input class="custom-color-toggle">
                </div>
                <input id="custom-color-selector_a_0">
                <input id="custom-color-selector_b_0">`;
        });

        it('updates round name', () => {
            mockMain.roundNameElem.innerText = '';

            helper.updateToggles([], 'COOL ROUND');

            expect(mockMain.roundNameElem.innerText).toEqual('COOL ROUND');
        });

        it('updates stages and modes if they have not been modified', () => {
            helper.updateToggles([{
                stage: 'MakoMart',
                mode: 'Rainmaker',
                winner: GameWinner.ALPHA,
                color: { }
            }], '');

            expect(elementById<HTMLInputElement>('stage-selector_0').value).toEqual('MakoMart');
            expect(elementById<HTMLInputElement>('mode-selector_0').value).toEqual('Rainmaker');
        });

        it('does not update stages and modes if they have been locally modified', () => {
            document.body.innerHTML = `
                <select id="stage-selector_0" data-edited="true">
                    <option selected value="Blackbelly Skatepark" />
                    <option value="MakoMart" />
                </select>
                <select id="mode-selector_0" data-edited="true">
                    <option selected value="Splat Zones" />
                    <option value="Rainmaker" />
                </select>
                <div id="game-editor_0">
                    <select class="color-selector">
                        <option selected value="cool-colors_0" />
                        <option value="cool-colors_1 /">
                        <option value="cool-colors_2" />
                    </select>
                    <input class="color-swap-toggle">
                    <input class="custom-color-toggle">
                </div>
                <input id="custom-color-selector_a_0">
                <input id="custom-color-selector_b_0">`;

            helper.updateToggles([{
                stage: 'MakoMart',
                mode: 'Rainmaker',
                winner: GameWinner.ALPHA,
                color: { }
            }], '');

            expect(elementById<HTMLInputElement>('stage-selector_0').value).toEqual('Blackbelly Skatepark');
            expect(elementById<HTMLInputElement>('mode-selector_0').value).toEqual('Splat Zones');
        });

        it('updates game winner data if winner is ALPHA', () => {
            helper.updateToggles([{
                stage: 'MakoMart',
                mode: 'Rainmaker',
                winner: GameWinner.ALPHA,
                color: { }
            }], '');

            expect(winButtons[GameWinner.NO_WINNER].disabled).toEqual(false);
            expect(winButtons[GameWinner.ALPHA].disabled).toEqual(true);
            expect(winButtons[GameWinner.BRAVO].disabled).toEqual(false);
        });

        it('updates game winner data if winner is BRAVO', () => {
            helper.updateToggles([{
                stage: 'MakoMart',
                mode: 'Rainmaker',
                winner: GameWinner.BRAVO,
                color: { }
            }], '');

            expect(winButtons[GameWinner.NO_WINNER].disabled).toEqual(false);
            expect(winButtons[GameWinner.ALPHA].disabled).toEqual(false);
            expect(winButtons[GameWinner.BRAVO].disabled).toEqual(true);
        });

        it('updates game winner data if winner is NO_WINNER', () => {
            helper.updateToggles([{
                stage: 'MakoMart',
                mode: 'Rainmaker',
                winner: GameWinner.NO_WINNER,
                color: { }
            }], '');

            expect(winButtons[GameWinner.NO_WINNER].disabled).toEqual(true);
            expect(winButtons[GameWinner.ALPHA].disabled).toEqual(false);
            expect(winButtons[GameWinner.BRAVO].disabled).toEqual(false);
        });

        it('updates color data if it is not edited', () => {
            helper.updateToggles([{
                stage: 'MakoMart',
                mode: 'Rainmaker',
                winner: GameWinner.ALPHA,
                color: {
                    index: 2,
                    categoryName: 'Cool Colors',
                    clrA: '#123',
                    clrB: '#345',
                    colorsSwapped: true,
                    isCustom: false
                }
            }], '');

            expect((document.querySelector('.color-swap-toggle') as HTMLInputElement).checked).toEqual(true);
            expect((document.querySelector('.custom-color-toggle') as HTMLInputElement).checked).toEqual(false);
            expect((document.querySelector('.color-selector') as HTMLSelectElement).value).toEqual('cool-colors_2');
            expect(elementById<HTMLInputElement>('custom-color-selector_a_0').value).toEqual('#123');
            expect(elementById<HTMLInputElement>('custom-color-selector_b_0').value).toEqual('#345');
            expect(mockToggleHelper.toggleCustomColorSelectorVisibility).toHaveBeenCalledWith(0, false);
            expect(mockWinToggleColorHelper.updateWinToggleColors).toHaveBeenCalledWith(0, '#123', '#345');
        });

        it('does not update color data if it is locally edited', () => {
            document.body.innerHTML = `
                <select id="stage-selector_0">
                    <option selected value="Blackbelly Skatepark" />
                    <option value="MakoMart" />
                </select>
                <select id="mode-selector_0">
                    <option selected value="Splat Zones" />
                    <option value="Rainmaker" />
                </select>
                <div id="game-editor_0">
                    <select class="color-selector" data-source="gameInfo-edited">
                        <option selected value="cool-colors_0" />
                        <option value="cool-colors_1 /">
                        <option value="cool-colors_2" />
                    </select>
                    <input class="color-swap-toggle">
                    <input class="custom-color-toggle">
                </div>
                <input id="custom-color-selector_a_0" value="#AAA">
                <input id="custom-color-selector_b_0" value="#BBB">`;

            helper.updateToggles([{
                stage: 'MakoMart',
                mode: 'Rainmaker',
                winner: GameWinner.ALPHA,
                color: {
                    index: 999,
                    categoryName: 'Cool Colors',
                    clrA: '#123',
                    clrB: '#345',
                    colorsSwapped: true,
                    isCustom: false
                }
            }], '');

            expect((document.querySelector('.color-swap-toggle') as HTMLInputElement).checked).toEqual(false);
            expect((document.querySelector('.custom-color-toggle') as HTMLInputElement).checked).toEqual(false);
            expect((document.querySelector('.color-selector') as HTMLSelectElement).value).toEqual('cool-colors_0');
            expect(elementById<HTMLInputElement>('custom-color-selector_a_0').value).toEqual('#AAA');
            expect(elementById<HTMLInputElement>('custom-color-selector_b_0').value).toEqual('#BBB');
            expect(mockToggleHelper.toggleCustomColorSelectorVisibility).not.toHaveBeenCalled();
            expect(mockWinToggleColorHelper.updateWinToggleColors).not.toHaveBeenCalled();
        });

        it('gets color from active round if it is not saved in the given round', () => {
            mockToggleHelper.getActiveRoundColors.mockReturnValue({
                index: 0,
                categoryName: 'Custom Color',
                clrA: '#678',
                clrB: '#876',
                isCustom: true
            });
            nodecg.replicants.swapColorsInternally.value = false;

            helper.updateToggles([{
                stage: 'MakoMart',
                mode: 'Rainmaker',
                winner: GameWinner.ALPHA,
                color: undefined
            }], '');

            expect((document.querySelector('.color-swap-toggle') as HTMLInputElement).checked).toEqual(false);
            expect((document.querySelector('.custom-color-toggle') as HTMLInputElement).checked).toEqual(true);
            expect((document.querySelector('.color-selector') as HTMLSelectElement).value).toEqual('custom-color_0');
            expect(elementById<HTMLInputElement>('custom-color-selector_a_0').value).toEqual('#678');
            expect(elementById<HTMLInputElement>('custom-color-selector_b_0').value).toEqual('#876');
            expect(mockToggleHelper.toggleCustomColorSelectorVisibility).toHaveBeenCalledWith(0, true);
            expect(mockWinToggleColorHelper.updateWinToggleColors).toHaveBeenCalledWith(0, '#678', '#876');
        });
    });
});
