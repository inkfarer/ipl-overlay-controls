import { setImportStatus } from '../globalScripts';
import { ImportStatus } from 'types/importStatus';

export function sendLocalFile(
    dataType: 'teams' | 'rounds',
    fileInput: HTMLInputElement,
    importStatusElem: HTMLElement): void {

    if (!fileInput.files[0]) return;

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('jsonType', dataType);

    fetch('/ipl-overlay-controls/upload-tournament-json', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (response.status === 200) {
                setImportStatus(ImportStatus.Success, importStatusElem);
            } else {
                console.error(`Import failed with status ${response.status}`);
                setImportStatus(ImportStatus.Failure, importStatusElem);
            }
        })
        .catch(e => {
            console.error(e);
            setImportStatus(ImportStatus.Failure, importStatusElem);
        });
}
