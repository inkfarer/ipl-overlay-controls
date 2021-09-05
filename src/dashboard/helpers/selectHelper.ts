import isEmpty from 'lodash/isEmpty';

export function clearSelectors(className: string): void {
    const selectors = document.getElementsByClassName(className);
    for (let i = 0; i < selectors.length; i++) {
        const element = selectors[i];
        element.innerHTML = '';
    }
}

export function addSelector(text: string, className: string, value?: string): void {
    const elements = document.querySelectorAll(`.${className}`);
    Array.from(elements).forEach(item => {
        item.appendChild(createSelector(text, isEmpty(value) ? text : value));
    });
}

export function createSelector(text: string, value: string): HTMLOptionElement {
    const result = document.createElement('option');
    result.value = value;
    result.text = text;
    return result;
}

export function fillList(selectElem: HTMLSelectElement, data: Array<string>): void {
    for (let i = 0; i < data.length; i++) {
        const element = data[i];
        const option = document.createElement('option');
        option.value = element;
        option.text = element;
        selectElem.add(option);
    }
}
