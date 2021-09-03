import { ImportStatus } from 'types/enums/importStatus';
import { colors } from '../styles/colors';

interface ImportStatusParams {
    backgroundColor: string;
    textColor: string;
    text: string;
    resetAfterTimeout: boolean
}

const statusParams: {[key in ImportStatus]: ImportStatusParams} = {
    [ImportStatus.SUCCESS]: {
        backgroundColor: colors.green,
        textColor: 'white',
        text: 'SUCCESS',
        resetAfterTimeout: true
    },
    [ImportStatus.LOADING]: {
        backgroundColor: colors.yellow,
        textColor: 'black',
        text: 'LOADING',
        resetAfterTimeout: false
    },
    [ImportStatus.FAILURE]: {
        backgroundColor: colors.red,
        textColor: 'white',
        text: 'FAIL',
        resetAfterTimeout: true
    },
    [ImportStatus.NO_DATA]: {
        backgroundColor: colors.yellow,
        textColor: 'black',
        text: 'NO DATA',
        resetAfterTimeout: true
    },
    [ImportStatus.NO_STATUS]: {
        backgroundColor: '#181e29',
        textColor: 'white',
        text: 'STATUS',
        resetAfterTimeout: false
    }
};

export function setImportStatus(status: ImportStatus, elem: HTMLElement): void {
    const { backgroundColor, textColor, text, resetAfterTimeout } = statusParams[status];

    elem.style.backgroundColor = backgroundColor;
    elem.style.color = textColor;
    elem.innerText = text;

    if (resetAfterTimeout) {
        setTimeout(() => {
            setImportStatus(ImportStatus.NO_STATUS, elem);
        }, 10000);
    }
}
