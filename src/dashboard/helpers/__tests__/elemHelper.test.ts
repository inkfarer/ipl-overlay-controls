import { appendChildren, dispatch, elementById } from '../elemHelper';

describe('elemHelper', () => {
    describe('appendChildren', () => {
        it('adds children to element', () => {
            const element = document.createElement('div');
            jest.spyOn(element, 'appendChild');
            const child1 = document.createElement('div');
            const child2 = document.createElement('div');

            appendChildren(element, child1, child2);

            expect(element.appendChild).toHaveBeenCalledTimes(2);
            expect(element.appendChild).toHaveBeenCalledWith(child1);
            expect(element.appendChild).toHaveBeenCalledWith(child2);
        });
    });

    describe('elementById', () => {
        it('calls document.getElementById', () => {
            const expectedResult = document.createElement('div');
            jest.spyOn(document, 'getElementById').mockReturnValue(expectedResult);

            const result = elementById<HTMLButtonElement>('ididid');

            expect(result).toEqual(expectedResult);
            expect(document.getElementById).toHaveBeenCalledWith('ididid');
        });
    });

    describe('dispatch', () => {
        it('dispatches event to element', () => {
            const element = document.createElement('div');
            jest.spyOn(element, 'dispatchEvent');

            dispatch(element, 'click');

            expect(element.dispatchEvent).toHaveBeenCalledWith(new Event('click'));
        });
    });
});
