export function setValueIfNotEdited(element: HTMLInputElement | HTMLSelectElement, value: string): void {
    if (element.dataset.edited !== 'true') {
        element.value = value;
    }
}
