import { appendChildren } from '../elemHelper';
import { addSelector, clearSelectors, createSelector, fillList } from '../selectHelper';

describe('selectHelper', () => {
    describe('clearSelectors', () => {
        function createMockSelect() {
            const select = document.createElement('select');
            select.classList.add('mock-select');
            select.appendChild(document.createElement('option'));
            return select;
        }

        it('clears selects with a specified class', () => {
            const select1 = createMockSelect();
            const select2 = createMockSelect();
            appendChildren(document.body, select1, select2);

            clearSelectors('mock-select');

            expect(select1.innerHTML).toEqual('');
            expect(select2.innerHTML).toEqual('');
        });
    });

    describe('addSelector', () => {
        function createMockSelect() {
            const select = document.createElement('select');
            select.classList.add('mock-select');
            return select;
        }

        it('adds option to selects with a specified class', () => {
            const select1 = createMockSelect();
            const select2 = createMockSelect();
            appendChildren(document.body, select1, select2);

            addSelector('Cool Option', 'mock-select', 'cooloption');

            const expectedInnerHtml = '<option value="cooloption">Cool Option</option>';
            expect(select1.innerHTML).toEqual(expectedInnerHtml);
            expect(select2.innerHTML).toEqual(expectedInnerHtml);
        });

        it('adds option to selects with a specified class when value is missing', () => {
            const select1 = createMockSelect();
            const select2 = createMockSelect();
            appendChildren(document.body, select1, select2);

            addSelector('Cool Option', 'mock-select');

            const expectedInnerHtml = '<option value="Cool Option">Cool Option</option>';
            expect(select1.innerHTML).toEqual(expectedInnerHtml);
            expect(select2.innerHTML).toEqual(expectedInnerHtml);
        });
    });

    describe('createSelector', () => {
        it('creates option element', () => {
            const result = createSelector('Option', 'opt');
            expect(result.value).toEqual('opt');
            expect(result.text).toEqual('Option');
        });
    });

    describe('fillList', () => {
        it('fills selector with options', () => {
            const select = document.createElement('select');

            fillList(select, ['opt1', 'opt2']);

            expect(select.innerHTML).toEqual('<option value="opt1">opt1</option><option value="opt2">opt2</option>');
        });
    });
});
