import { MockNodecg } from '../../__mocks__/mockNodecg';
import { dispatch, elementById } from '../../helpers/elemHelper';
import * as emptyModule from '../../__mocks__/emptyModule';
import { when } from 'jest-when';

describe('main', () => {
    const mockUpdateToggles = jest.fn();
    const mockAddToggle = jest.fn();
    let nodecg: MockNodecg;

    jest.mock('../roundUpdater', () => emptyModule);
    jest.mock('../teamAndRoundDataSelector', () => emptyModule);
    jest.mock('../toggleCreator', () => ({
        __esModule: true,
        addToggle: mockAddToggle
    }));
    jest.mock('../toggleHelper', () => emptyModule);
    jest.mock('../toggleUpdater', () => ({
        __esModule: true,
        updateToggles: mockUpdateToggles
    }));

    beforeEach(() => {
        jest.resetModules();

        nodecg = new MockNodecg();
        nodecg.init();

        document.body.innerHTML = `
            <div id="round-name" />
            <div id="toggles" />
            <input id="enable-color-edit-toggle">
            <button id="btn-reset" />`;
        require('../main');
    });

    describe('activeRound change', () => {
        it('creates toggles on first load', () => {
            elementById('toggles').innerHTML = '<span>SOME CONTENT</span>';

            nodecg.listeners.activeRound(
                { games: [ {}, {}, {} ], round: { name: 'Round 1' } },
                undefined);

            expect(elementById('toggles').innerHTML).toEqual('');
            expect(elementById('round-name').innerText).toEqual('Round 1');
            expect(mockAddToggle).toHaveBeenCalledTimes(3);
        });

        it('creates toggles if round id has changed', () => {
            elementById('toggles').innerHTML = '<span>SOME CONTENT</span>';

            nodecg.listeners.activeRound(
                { games: [ {}, {}, {}, {}, {} ], round: { name: 'Round 2', id: 'newnewroundround' } },
                { round: { id: 'oldoldroundround' } });

            expect(elementById('toggles').innerHTML).toEqual('');
            expect(elementById('round-name').innerText).toEqual('Round 2');
            expect(mockAddToggle).toHaveBeenCalledTimes(5);
        });

        it('updates toggles if the round is the same', () => {
            const games = [ {}, {}, {}, {}, {} ];

            nodecg.listeners.activeRound(
                { games: games, round: { name: 'Round 2', id: 'newnewroundround' } },
                { round: { id: 'newnewroundround' } });

            expect(mockUpdateToggles).toHaveBeenCalledWith(games, 'Round 2');
        });
    });

    describe('enableColorEditToggle change', () => {
        const mockColorSelector = document.createElement('div');
        const mockRoundDataSelector = document.createElement('select');

        beforeEach(() => {
            jest.spyOn(document, 'querySelectorAll');

            when(document.querySelectorAll).calledWith('.color-selector-wrapper')
                .mockReturnValue([mockColorSelector] as unknown as NodeListOf<HTMLDivElement>);

            when(document.querySelectorAll).calledWith('.mode-selector, .stage-selector')
                .mockReturnValue([mockRoundDataSelector] as unknown as NodeListOf<HTMLSelectElement>);
        });

        it('displays color data editors if checked', () => {
            const toggle = elementById<HTMLInputElement>('enable-color-edit-toggle');
            toggle.checked = true;

            dispatch(toggle, 'change');

            expect(mockColorSelector.style.display).toEqual('');
            expect(mockRoundDataSelector.style.display).toEqual('none');
        });

        it('displays round data editors if unchecked', () => {
            const toggle = elementById<HTMLInputElement>('enable-color-edit-toggle');
            toggle.checked = false;

            dispatch(toggle, 'change');

            expect(mockColorSelector.style.display).toEqual('none');
            expect(mockRoundDataSelector.style.display).toEqual('');
        });
    });

    describe('reset button confirm', () => {
        it('sends a message', () => {
            dispatch(elementById('btn-reset'), 'confirm');

            expect(nodecg.sendMessage).toHaveBeenCalledWith('resetActiveRound');
        });
    });
});
