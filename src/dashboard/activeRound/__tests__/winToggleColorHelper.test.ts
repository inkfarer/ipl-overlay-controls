import { MockNodecg } from '../../__mocks__/mockNodecg_legacy';
import { Module } from '../../../helpers/__mocks__/module';
import { GameWinner } from 'types/enums/gameWinner';

describe('winToggleColorHelper', () => {
    const mockToggleHelper = {
        __esModule: true,
        getActiveRoundColors: jest.fn(),
        getWinToggles: jest.fn(),
        toggleCustomColorSelectorVisibility: jest.fn()
    };
    let nodecg: MockNodecg;
    let helper: Module;

    jest.mock('../toggleHelper', () => mockToggleHelper);

    beforeEach(() => {
        jest.resetModules();
        jest.resetAllMocks();

        nodecg = new MockNodecg();
        nodecg.init();

        helper = require('../winToggleColorHelper');
    });

    const winToggle = (team: 'a' | 'b', disabled: boolean) => {
        const result = document.createElement('button');
        result.classList.add(`team-${team}-win-toggle`);
        result.disabled = disabled;
        return result;
    };

    describe('updateWinToggleColors', () => {
        it('updates button colors', () => {
            const alphaButton = winToggle('a', true);
            const bravoButton = winToggle('b', false);
            const buttons = {
                [GameWinner.ALPHA]: alphaButton,
                [GameWinner.BRAVO]: bravoButton
            };
            mockToggleHelper.getWinToggles.mockReturnValue(buttons);

            helper.updateWinToggleColors(0, '#123', '#456');

            expect(alphaButton.style.backgroundColor).toEqual('rgb(17, 34, 51)');
            expect(alphaButton.style.borderLeft).toEqual('8px solid #123');
            expect(bravoButton.style.backgroundColor).toEqual('rgb(68, 85, 102)');
            expect(bravoButton.style.borderRight).toEqual('0 solid #456');
        });
    });

    describe('setWinToggleColor', () => {
        it('sets button style if button is A win toggle and not disabled', () => {
            const toggle = winToggle('a', false);

            helper.setWinToggleColor(toggle, '#325');

            expect(toggle.style.backgroundColor).toEqual('rgb(51, 34, 85)');
            expect(toggle.style.color).toEqual('white');
            expect(toggle.style.borderLeft).toEqual('0 solid #325');
        });

        it('sets button style if button is A win toggle and disabled', () => {
            const toggle = winToggle('a', true);

            helper.setWinToggleColor(toggle, '#325');

            expect(toggle.style.backgroundColor).toEqual('rgb(51, 34, 85)');
            expect(toggle.style.color).toEqual('white');
            expect(toggle.style.borderLeft).toEqual('8px solid #325');
        });

        it('sets button style if button is B win toggle and not disabled', () => {
            const toggle = winToggle('b', false);

            helper.setWinToggleColor(toggle, '#AAB');

            expect(toggle.style.backgroundColor).toEqual('rgb(170, 170, 187)');
            expect(toggle.style.color).toEqual('white');
            expect(toggle.style.borderRight).toEqual('0 solid #AAB');
        });

        it('sets button style if button is B win toggle and disabled', () => {
            const toggle = winToggle('b', true);

            helper.setWinToggleColor(toggle, '#bbd');

            expect(toggle.style.backgroundColor).toEqual('rgb(187, 187, 221)');
            expect(toggle.style.color).toEqual('white');
            expect(toggle.style.borderRight).toEqual('8px solid #bbd');
        });
    });
});
