// For selectors

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
        item.appendChild(createSelector(text, value === '' ? text : value));
    });
}

export function createSelector(text: string, value: string): HTMLOptionElement {
    const result = document.createElement('option');
    result.value = value;
    result.text = text;
    return result;
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

        element.addEventListener(event, e => {
            const target = e.target as HTMLElement;
            target.dataset.edited = 'true';
            updateButton.style.backgroundColor = 'var(--red)';
        });
    });

    updateButton.addEventListener('click', () => {
        elements.forEach(elem => {
            elem.dataset.edited = 'false';
        });
        updateButton.style.backgroundColor = 'var(--blue)';
    });
}

export function addDots(value: string, maxLength = 48): string {
    const rolloff = '...';

    if (!value) return value;
    if (value.length > maxLength) {
        return value.substring(0, maxLength - rolloff.length) + rolloff;
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

export function hideElement(element: HTMLElement): void {
    element.style.display = 'none';
}

export function showElement(element: HTMLElement): void {
    element.style.removeProperty('display');
}

export function showMessage(
    key: string,
    type: 'info' | 'warning',
    message: string,
    creationCallback = prependToBody
): void {
    const existingMessage = document.getElementById(key);

    if (!existingMessage) {
        const newMessage = document.createElement('div');
        const iconElement = {
            info: '<i class="icon fas fa-info-circle"></i>',
            warning: '<i class="icon fas fa-exclamation-triangle"></i>'
        }[type];

        newMessage.innerHTML = `${iconElement}<div class="content">${message}</div>`;
        newMessage.classList.add('space', type, 'layout', 'message');
        newMessage.id = key;
        creationCallback(newMessage);
    } else {
        const messageContent = existingMessage.querySelector('.content') as HTMLElement;
        messageContent.innerText = message;

        if (!existingMessage.classList.contains(type)) {
            existingMessage.classList.remove('info', 'warning');
            existingMessage.classList.add(type);
        }

        existingMessage.style.display = '';
    }
}

function prependToBody(elem: HTMLElement): void {
    document.body.prepend(elem);
}

export function hideMessage(key: string): void {
    const existingMessage = document.getElementById(key);
    if (existingMessage) {
        existingMessage.style.display = 'none';
    }
}

export function appendElementAfter(newElement: HTMLElement, element: HTMLElement): void {
    element.parentNode.insertBefore(newElement, element.nextSibling);
}
