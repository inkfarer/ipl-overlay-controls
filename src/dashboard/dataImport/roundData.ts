import { setImportStatus } from '../importStatus';
import { sendLocalFile } from './postData';
import { ImportStatus } from 'types/enums/importStatus';

const roundWebImportToggle = document.getElementById('round-web-import-toggle') as HTMLInputElement;
const roundImportFileInput = document.getElementById('round-input-file-input') as HTMLInputElement;
const roundDataStatusElem = document.getElementById('round-data-submit-status');

document.getElementById('round-import-submit').addEventListener('click', () => {
    setImportStatus(ImportStatus.LOADING, roundDataStatusElem);

    if (roundWebImportToggle.checked) {
        const listsURL = (document.getElementById('round-input-url-input') as HTMLInputElement).value;
        nodecg.sendMessage('getRounds', { url: listsURL }, e => {
            if (e) {
                console.error(e);
                setImportStatus(ImportStatus.FAILURE, roundDataStatusElem);
                return;
            }

            setImportStatus(ImportStatus.SUCCESS, roundDataStatusElem);
        });
    } else {
        sendLocalFile('rounds', roundImportFileInput, roundDataStatusElem);
    }
});

roundWebImportToggle.addEventListener('click', e => {
    const fileInput = document.getElementById('local-round-input-wrapper');
    const urlInput = document.getElementById('web-file-input-wrapper');

    const hiddenElem = (e.target as HTMLInputElement).checked ? fileInput : urlInput;
    const shownElem = (e.target as HTMLInputElement).checked ? urlInput : fileInput;

    shownElem.style.display = '';
    hiddenElem.style.display = 'none';
});
