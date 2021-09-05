export function appendChildren(element: HTMLElement, ...children: HTMLElement[]): void {
    children.forEach(elem => {
        element.appendChild(elem);
    });
}

export function elementById<T extends HTMLElement>(id: string): T | undefined {
    return document.getElementById(id) as T;
}

export function dispatch(element: EventTarget, event: string): void {
    element.dispatchEvent(new Event(event));
}

export function hideElement(element: HTMLElement): void {
    element.style.display = 'none';
}

export function showElement(element: HTMLElement): void {
    element.style.removeProperty('display');
}

export function prependToBody(elem: HTMLElement): void {
    document.body.prepend(elem);
}

export function appendElementAfter(newElement: HTMLElement, element: HTMLElement): void {
    element.parentNode.insertBefore(newElement, element.nextSibling);
}
