import { MockNodecg } from '../../__mocks__/mockNodecg';
import { Module } from '../../../helpers/__mocks__/module';
import { elementById } from '../../helpers/elemHelper';
import { GameWinner } from 'types/enums/gameWinner';

describe('toggleHelper', () => {
    const mockWinToggleColorHelper = {
        __esModule: true,
        updateWinToggleColors: jest.fn(),
        setWinToggleColor: jest.fn()
    };
    let nodecg: MockNodecg;
    let helper: Module;

    jest.mock('../winToggleColorHelper', () => mockWinToggleColorHelper);

    beforeEach(() => {
        jest.resetModules();
        jest.resetAllMocks();

        nodecg = new MockNodecg();
        nodecg.init();

        helper = require('../toggleHelper');
    });

    describe('handleCustomColorListenerChange', () => {
        it('updates selector datasets and button colors', () => {
            document.body.innerHTML = `
            <select id="color-selector_0">
            <input id="color-swap-toggle_0">
            <div id="custom-color-select-wrapper_0">
                <input class="team-a" value="#123123">
                <input class="team-b" value="#AAAAAA">
            </div>`;

            helper.handleCustomColorListenerChange({
                target: { id: 'custom-color-selector_a_0' }
            });

            expect(elementById('color-selector_0').dataset.source).toEqual('gameInfo-edited');
            expect(elementById('color-swap-toggle_0').dataset.source).toEqual('gameInfo-edited');
            expect(mockWinToggleColorHelper.updateWinToggleColors).toHaveBeenCalledWith(0, '#123123', '#AAAAAA');
        });
    });

    describe('handleColorSelectorChange', () => {
        it('updates selector datasets and button colors if color swap toggle is unchecked', () => {
            document.body.innerHTML = `
                <input id="color-swap-toggle_1">`;
            const target = {
                id: 'color-selector_1',
                dataset: { source: '' },
                options: [ { dataset: { firstColor: '#123123', secondColor: '#AAAAAA' } } ],
                selectedIndex: 0
            };

            helper.handleColorSelectorChange({
                target
            });

            expect(target.dataset.source).toEqual('gameInfo-edited');
            expect(elementById('color-swap-toggle_1').dataset.source).toEqual('gameInfo-edited');
            expect(mockWinToggleColorHelper.updateWinToggleColors).toHaveBeenCalledWith(1, '#123123', '#AAAAAA');
        });

        it('updates selector datasets and button colors if color swap toggle is checked', () => {
            document.body.innerHTML = `
                <input id="color-swap-toggle_1" checked>`;
            const target = {
                id: 'color-selector_1',
                dataset: { source: '' },
                options: [ { dataset: { firstColor: '#123123', secondColor: '#AAAAAA' } } ],
                selectedIndex: 0
            };

            helper.handleColorSelectorChange({
                target
            });

            expect(target.dataset.source).toEqual('gameInfo-edited');
            expect(elementById('color-swap-toggle_1').dataset.source).toEqual('gameInfo-edited');
            expect(mockWinToggleColorHelper.updateWinToggleColors).toHaveBeenCalledWith(1, '#AAAAAA', '#123123');
        });
    });

    describe('handleColorSwapToggleChange', () => {
        it('updates data if data source is scoreboard', () => {
            nodecg.replicants.swapColorsInternally.value = false;

            helper.handleColorSwapToggleChange({
                target: { dataset: { source: 'scoreboard' }, checked: true }
            });

            expect(nodecg.replicants.swapColorsInternally.value).toEqual(true);
        });

        it('updates data if data source is gameInfo', () => {
            nodecg.replicants.activeRound.value = {
                games: [{ color: { title: 'Other color', colorsSwapped: true, clrA: '#234', clrB: '#ABC' } }]
            };

            helper.handleColorSwapToggleChange({
                target: { dataset: { source: 'gameInfo' }, id: 'color-swap-toggle_0' }
            });

            expect(nodecg.replicants.activeRound.value).toEqual({
                games: [{ color: { title: 'Other color', colorsSwapped: false, clrA: '#ABC', clrB: '#234' } }]
            });
        });

        it('updates data if data source is gameInfo-edited and a custom color is selected', () => {
            nodecg.replicants.activeRound.value = {
                games: [{ color: { title: 'Other color', colorsSwapped: true, clrA: '#234', clrB: '#ABC' } }]
            };
            document.body.innerHTML = `
                <input id="custom-color-toggle_0" checked>
                <input id="custom-color-selector_a_0" value="#345">
                <input id="custom-color-selector_b_0" value="#BDE">`;

            helper.handleColorSwapToggleChange({
                target: { dataset: { source: 'gameInfo-edited' }, id: 'color-swap-toggle_0' }
            });

            expect(elementById<HTMLInputElement>('custom-color-selector_a_0').value).toEqual('#BDE');
            expect(elementById<HTMLInputElement>('custom-color-selector_b_0').value).toEqual('#345');
            expect(mockWinToggleColorHelper.updateWinToggleColors).toHaveBeenCalledWith(0, '#BDE', '#345');
        });

        it('updates data if data source is gameInfo-edited and a custom color is not selected', () => {
            nodecg.replicants.activeRound.value = {
                games: [{ color: { title: 'Other color', colorsSwapped: true, clrA: '#234', clrB: '#ABC' } }]
            };
            document.body.innerHTML = `
                <input id="custom-color-toggle_2">
                <select id="color-selector_2">
                    <option selected data-first-color="#345" data-second-color="#123">
                </select>`;

            helper.handleColorSwapToggleChange({
                target: { dataset: { source: 'gameInfo-edited' }, id: 'color-swap-toggle_2', checked: true }
            });

            expect(mockWinToggleColorHelper.updateWinToggleColors).toHaveBeenCalledWith(2, '#123', '#345');
        });
    });

    describe('toggleCustomColorSelectorVisibility', () => {
        it('updates styles if is not custom color', () => {
            document.body.innerHTML = `
                <div id="custom-color-select-wrapper_2">
                <div id="color-selector_2">
                <input id="custom-color-toggle_2" checked>
            `;

            helper.toggleCustomColorSelectorVisibility(2, false);

            expect(elementById('custom-color-select-wrapper_2').style.display).toEqual('none');
            expect(elementById('color-selector_2').style.display).toEqual('');
            expect(elementById<HTMLInputElement>('custom-color-toggle_2').checked).toEqual(false);
        });

        it('updates styles if is custom color', () => {
            document.body.innerHTML = `
                <div id="custom-color-select-wrapper_2">
                <div id="color-selector_2">
                <input id="custom-color-toggle_2">
            `;

            helper.toggleCustomColorSelectorVisibility(2, true);

            expect(elementById('custom-color-select-wrapper_2').style.display).toEqual('');
            expect(elementById('color-selector_2').style.display).toEqual('none');
            expect(elementById<HTMLInputElement>('custom-color-toggle_2').checked).toEqual(true);
        });
    });

    describe('getWinToggles', () => {
        it('gets toggles by key', () => {
            document.body.innerHTML = `
                <button id="no-win-toggle_0">
                <button id="team-a-win-toggle_0">
                <button id="team-b-win-toggle_0">
                <button id="no-win-toggle_4">
                <button id="team-a-win-toggle_4">
                <button id="team-b-win-toggle_4">`;

            expect(helper.getWinToggles(0)).toEqual({
                [GameWinner.NO_WINNER]: elementById('no-win-toggle_0'),
                [GameWinner.ALPHA]: elementById('team-a-win-toggle_0'),
                [GameWinner.BRAVO]: elementById('team-b-win-toggle_0'),
            });
            expect(helper.getWinToggles(4)).toEqual({
                [GameWinner.NO_WINNER]: elementById('no-win-toggle_4'),
                [GameWinner.ALPHA]: elementById('team-a-win-toggle_4'),
                [GameWinner.BRAVO]: elementById('team-b-win-toggle_4'),
            });
        });
    });

    describe('getActiveRoundColors', () => {
        it('aggregates data from activeRound', () => {
            nodecg.replicants.activeRound.value = {
                activeColor: { title: 'Cool Color' },
                teamA: { color: '#123' },
                teamB: { color: '#345' }
            };

            expect(helper.getActiveRoundColors()).toEqual({ title: 'Cool Color', clrA: '#123', clrB: '#345' });
        });
    });
});
