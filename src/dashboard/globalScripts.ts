// For selectors

import { ImportStatus } from 'types/importStatus';

export function clearSelectors(className: string): void {
    const selectors = document.getElementsByClassName(className);
    for (let i = 0; i < selectors.length; i++) {
        const element = selectors[i];
        element.innerHTML = '';
    }
}

export function addSelector(text: string, className: string, value: string): void {
    const elements = document.querySelectorAll(`.${className}`);
    Array.from(elements).forEach(item => {
        const opt = document.createElement('option');
        opt.value = value === '' ? text : value;
        opt.text = text;
        item.appendChild(opt);
    });
}

// For toggling show/hide buttons

export function setToggleButtonDisabled(
    toggleTrue: HTMLButtonElement,
    toggleFalse: HTMLButtonElement,
    state: boolean): void {
    toggleTrue.disabled = state;
    toggleFalse.disabled = !state;
}

// Remind user to press 'update'

export function addChangeReminder(
    elements: HTMLElement[] | NodeListOf<HTMLElement>,
    updateButton: HTMLButtonElement): void {
    elements.forEach(element => {
        if (!element.tagName) return;

        let event;
        if (element.tagName.toLowerCase() === 'input') event = 'input';
        else if (element.tagName.toLowerCase() === 'select') event = 'change';
        else return;

        element.addEventListener(event, () => {
            updateButton.style.backgroundColor = 'var(--red)';
        });
    });

    updateButton.addEventListener('click', () => {
        updateButton.style.backgroundColor = 'var(--blue)';
    });
}

export function addDots(value: string): string {
    const maxNameLength = 48;
    const rolloff = '...';

    if (!value) return value;
    if (value.length > maxNameLength) {
        return value.substring(0, maxNameLength - rolloff.length) + rolloff;
    }

    return value;
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

export function setImportStatus(status: ImportStatus, elem: HTMLElement): void {
    let backgroundColor;
    let textColor;
    let text;
    switch (status) {
        case ImportStatus.Success:
            backgroundColor = 'var(--green)';
            textColor = 'white';
            text = 'SUCCESS';
            break;
        case ImportStatus.Loading:
            backgroundColor = 'var(--yellow)';
            textColor = 'black';
            text = 'LOADING';
            break;
        case ImportStatus.Failure:
            backgroundColor = 'var(--red)';
            textColor = 'white';
            text = 'FAIL';
            break;
        default:
            backgroundColor = '#181e29';
            textColor = 'white';
            text = 'UNKNOWN';
    }

    elem.style.backgroundColor = backgroundColor;
    elem.style.color = textColor;
    elem.innerText = text;
}

