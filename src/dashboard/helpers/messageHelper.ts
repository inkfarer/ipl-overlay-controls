import { appendChildren, prependToBody } from './elemHelper';

export function showMessage(
    key: string,
    type: 'info' | 'warning',
    message: string,
    creationCallback = prependToBody
): void {
    const existingMessage = document.getElementById(key);

    if (!existingMessage) {
        const newMessage = document.createElement('div');
        const iconElem = document.createElement('i');
        const iconClass = {
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle'
        }[type];
        iconElem.classList.add('icon', 'fas', iconClass);
        const messageContent = document.createElement('div');
        messageContent.classList.add('content');
        messageContent.textContent = message;

        appendChildren(newMessage, iconElem, messageContent);
        newMessage.classList.add('space', type, 'layout', 'message');
        newMessage.id = key;
        creationCallback(newMessage);
    } else {
        const messageContent = existingMessage.querySelector('.content') as HTMLElement;
        messageContent.textContent = message;

        if (!existingMessage.classList.contains(type)) {
            existingMessage.classList.remove('info', 'warning');
            existingMessage.classList.add(type);
        }

        existingMessage.style.display = '';
    }
}

export function hideMessage(key: string): void {
    const existingMessage = document.getElementById(key);
    if (existingMessage) {
        existingMessage.style.display = 'none';
    }
}
