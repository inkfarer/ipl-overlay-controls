import { ImportStatus } from 'types/enums/importStatus';

export function setImportStatus(status: ImportStatus, elem: HTMLElement): void {
    let backgroundColor;
    let textColor;
    let text;
    let resetAfterTimeout = true;

    switch (status) {
        case ImportStatus.SUCCESS:
            backgroundColor = 'var(--green)';
            textColor = 'white';
            text = 'SUCCESS';
            break;
        case ImportStatus.LOADING:
            backgroundColor = 'var(--yellow)';
            textColor = 'black';
            text = 'LOADING';
            resetAfterTimeout = false;
            break;
        case ImportStatus.FAILURE:
            backgroundColor = 'var(--red)';
            textColor = 'white';
            text = 'FAIL';
            break;
        case ImportStatus.NO_DATA:
            backgroundColor = 'var(--yellow)';
            textColor = 'black';
            text = 'NO DATA';
            break;
        case ImportStatus.NO_STATUS:
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
            setImportStatus(ImportStatus.NO_STATUS, elem);
        }, 10000);
    }
}
