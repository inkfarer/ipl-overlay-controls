import {
    appendChildren, appendElementAfter, dispatch, elementById, hideElement, prependToBody, showElement
} from '../elemHelper';

describe('elemHelper', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

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

    describe('hideElement', () => {
        it('sets display to none', () => {
            const elem = document.createElement('div');

            hideElement(elem);

            expect(elem.style.display).toEqual('none');
        });
    });

    describe('showElement', () => {
        it('removes display property', () => {
            const elem = document.createElement('div');
            elem.style.display = 'none';

            showElement(elem);

            expect(elem.style.display).toEqual('');
        });
    });

    describe('prependToBody', () => {
        it('prepends element to document body', () => {
            document.body.innerHTML = '<div></div><button></button><b></b>';

            prependToBody(document.createElement('span'));

            expect(document.body.innerHTML).toEqual('<span></span><div></div><button></button><b></b>');
        });
    });

    describe('appendElementAfter', () => {
        it('appends element after another one', () => {
            document.body.appendChild(document.createElement('div'));
            document.body.appendChild(document.createElement('div'));
            const elemToAppendAfter = document.createElement('div');
            document.body.appendChild(elemToAppendAfter);
            document.body.appendChild(document.createElement('div'));

            appendElementAfter(document.createElement('button'), elemToAppendAfter);

            expect(document.body.innerHTML)
                .toEqual('<div></div><div></div><div></div><button></button><div></div>');
        });
    });
});
