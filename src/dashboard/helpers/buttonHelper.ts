import { colors } from '../styles/colors';

export function setToggleButtonDisabled(
    toggleTrue: HTMLButtonElement,
    toggleFalse: HTMLButtonElement,
    state: boolean
): void {
    toggleTrue.disabled = state;
    toggleFalse.disabled = !state;
}

export function addChangeReminder(
    elements: HTMLElement[] | NodeListOf<HTMLElement>,
    updateButton: HTMLButtonElement
): void {
    elements.forEach(element => {
        if (!element.tagName) return;

        let event;
        if (element.tagName.toLowerCase() === 'input') event = 'input';
        else if (element.tagName.toLowerCase() === 'select') event = 'change';
        else return;

        element.addEventListener(event, e => {
            const target = e.target as HTMLElement;
            target.dataset.edited = 'true';
            updateButton.style.backgroundColor = colors.red;
        });
    });

    updateButton.addEventListener('click', () => {
        elements.forEach(elem => {
            elem.dataset.edited = 'false';
        });
        updateButton.style.backgroundColor = colors.blue;
    });
}
