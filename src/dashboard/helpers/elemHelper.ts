export function addClasses(element: HTMLElement, ...classes: string[]): void {
    classes.forEach(cls => {
        element.classList.add(cls);
    });
}

export function appendChildren(element: HTMLElement, ...children: HTMLElement[]): void {
    children.forEach(elem => {
        element.appendChild(elem);
    });
}
