import '../multiSelect';
import { MultiSelect } from '../multiSelect';
import { dispatch, elementById } from '../../helpers/elemHelper';
import { UnknownFunction } from '../../../helpers/__mocks__/module';

describe('multiSelect', () => {
    it('is defined as a custom element', () => {
        expect(window.customElements.get('multi-select')).not.toBeUndefined();
    });

    it('throws error if element does not contain a select', () => {
        expect(() => new MultiSelect()).toThrow('No select given to multi-select!');
    });

    it('gets select given as element child', () => {
        document.body.innerHTML = `
        <multi-select id="ms">
            <select class="inner-select">
                <option value="opt-one"/>
                <option value="opt-two"/>
            </select>
        </multi-select>`;

        const multiSelect = elementById<MultiSelect>('ms');
        expect(multiSelect.select.options.length).toEqual(2);
        expect(multiSelect.select.classList).toContain('inner-select');
    });

    it('handles values being selected', () => {
        document.body.innerHTML = `
        <multi-select id="ms">
            <select>
                <option value="opt-one"/>
                <option value="opt-two"/>
                <option value="opt-three"/>
            </select>
        </multi-select>`;
        const multiSelect = elementById<MultiSelect>('ms');
        jest.spyOn(multiSelect, 'dispatchEvent');
        const innerSelect = multiSelect.select;
        innerSelect.value = 'opt-two';
        dispatch(innerSelect, 'change');

        expect(innerSelect.selectedIndex).toEqual(-1);
        expect(multiSelect.selectedOptions.length).toEqual(1);
        expect(multiSelect.selectedOptions[0].value).toEqual('opt-two');
        expect(multiSelect.dispatchEvent).toHaveBeenCalledWith(new Event('change'));
        expect(multiSelect.selectedElemDisplay.innerHTML).toMatchSnapshot();
    });

    it('handles the same value being selected more than once', () => {
        document.body.innerHTML = `
        <multi-select id="ms">
            <select>
                <option value="opt-one"/>
                <option value="opt-two"/>
                <option value="opt-three"/>
            </select>
        </multi-select>`;
        const multiSelect = elementById<MultiSelect>('ms');
        jest.spyOn(multiSelect, 'dispatchEvent');
        const innerSelect = multiSelect.select;
        innerSelect.value = 'opt-two';
        dispatch(innerSelect, 'change');
        innerSelect.value = 'opt-two';
        dispatch(innerSelect, 'change');

        expect(innerSelect.selectedIndex).toEqual(-1);
        expect(multiSelect.selectedOptions.length).toEqual(1);
        expect(multiSelect.selectedOptions[0].value).toEqual('opt-two');
        expect(multiSelect.dispatchEvent).toHaveBeenCalledWith(new Event('change'));
        expect(multiSelect.dispatchEvent).toHaveBeenCalledTimes(1);
        expect(multiSelect.selectedElemDisplay.innerHTML).toMatchSnapshot();
    });

    it('handles multiple values being selected', () => {
        document.body.innerHTML = `
        <multi-select id="ms">
            <select>
                <option value="opt-one"/>
                <option value="opt-two"/>
                <option value="opt-three"/>
            </select>
        </multi-select>`;
        const multiSelect = elementById<MultiSelect>('ms');
        jest.spyOn(multiSelect, 'dispatchEvent');
        const innerSelect = multiSelect.select;
        innerSelect.value = 'opt-two';
        dispatch(innerSelect, 'change');
        innerSelect.value = 'opt-three';
        dispatch(innerSelect, 'change');

        expect(innerSelect.selectedIndex).toEqual(-1);
        expect(multiSelect.selectedOptions.length).toEqual(2);
        expect(multiSelect.selectedOptions[0].value).toEqual('opt-two');
        expect(multiSelect.selectedOptions[1].value).toEqual('opt-three');
        expect(multiSelect.dispatchEvent).toHaveBeenNthCalledWith(1, new Event('change'));
        expect(multiSelect.dispatchEvent).toHaveBeenNthCalledWith(2, new Event('change'));
        expect(multiSelect.selectedElemDisplay.innerHTML).toMatchSnapshot();
    });

    it('handles deletions of selected options', () => {
        document.body.innerHTML = `
        <multi-select id="ms">
            <select>
                <option value="opt-one">owo</option>
                <option value="opt-two">owo</option>
                <option value="opt-three">owo</option>
                <option value="opt-four">uwu</option>
            </select>
        </multi-select>`;
        const multiSelect = elementById<MultiSelect>('ms');
        const innerSelect = multiSelect.select;
        innerSelect.value = 'opt-two';
        dispatch(innerSelect, 'change');
        innerSelect.value = 'opt-three';
        dispatch(innerSelect, 'change');
        innerSelect.value = 'opt-four';
        dispatch(innerSelect, 'change');

        const selectedElemDisplay = multiSelect.selectedElemDisplay;
        selectedElemDisplay.dispatchEvent(
            createClickEvent(selectedElemDisplay.querySelector('div[data-option-value="opt-two"]')));
        selectedElemDisplay.dispatchEvent(
            createClickEvent(selectedElemDisplay.querySelector('div[data-option-value="opt-four"]')));

        expect(multiSelect.selectedOptions.length).toEqual(1);
        expect(multiSelect.selectedOptions[0].value).toEqual('opt-three');
        expect(multiSelect.selectedElemDisplay.innerHTML).toMatchSnapshot();
    });

    it('handles options being changed', () => {
        let mutationObserverCallback: UnknownFunction;
        // @ts-ignore: just a test
        global.MutationObserver = class {
            constructor(callback: UnknownFunction) {
                mutationObserverCallback = callback;
            }
            observe = jest.fn();
        };

        document.body.innerHTML = `
        <multi-select id="ms">
            <select>
                <option value="opt-one">owo</option>
                <option value="opt-two">owo</option>
                <option value="opt-three">owo</option>
                <option value="opt-four">uwu</option>
            </select>
        </multi-select>`;
        const multiSelect = elementById<MultiSelect>('ms');
        const innerSelect = multiSelect.select;
        innerSelect.value = 'opt-two';
        dispatch(innerSelect, 'change');
        innerSelect.value = 'opt-three';
        dispatch(innerSelect, 'change');

        expect(multiSelect.selectedOptions.length).toEqual(2);

        innerSelect.innerHTML = `
            <option value="opt-one">owo</option>
            <option value="opt-two">owo</option>
            <option value="opt-four">uwu</option>`;

        if (!mutationObserverCallback) {
            fail('No mutation observer callback found.');
        } else {
            mutationObserverCallback();
        }

        expect(multiSelect.selectedOptions.length).toEqual(1);
    });
});

function createClickEvent(target: HTMLElement): Event {
    const result = new Event('click');
    Object.defineProperty(result, 'target', { writable: false, value: target });
    return result;
}
