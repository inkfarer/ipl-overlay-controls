import { ImportStatus } from 'types/importStatus';

export function setImportStatus(status: ImportStatus, elem: HTMLElement): void {
    let backgroundColor;
    let textColor;
    let text;
    let resetAfterTimeout = true;

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
            resetAfterTimeout = false;
            break;
        case ImportStatus.Failure:
            backgroundColor = 'var(--red)';
            textColor = 'white';
            text = 'FAIL';
            break;
        case ImportStatus.NoData:
            backgroundColor = 'var(--yellow)';
            textColor = 'black';
            text = 'NO DATA';
            break;
        case ImportStatus.NoStatus:
            backgroundColor = '#181e29';
            textColor = 'white';
            text = 'STATUS';
            resetAfterTimeout = false;
            break;
        default:
            backgroundColor = '#181e29';
            textColor = 'white';
            text = 'UNKNOWN';
    }

    elem.style.backgroundColor = backgroundColor;
    elem.style.color = textColor;
    elem.innerText = text;

    if (resetAfterTimeout) {
        setTimeout(() => {
            setImportStatus(ImportStatus.NoStatus, elem);
        }, 10000);
    }
}
