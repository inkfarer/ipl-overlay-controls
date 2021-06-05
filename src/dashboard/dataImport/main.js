import '../globalStyles.css';
import './dataImport.css';

const tournamentData = nodecg.Replicant('tournamentData');

const teamWebImportToggle = document.getElementById('team-web-import-toggle');
const methodSelector = document.getElementById('method-selector');

document.getElementById('submit-import').onclick = () => {
    setImportStatus(IMPORT_STATUS_LOADING, teamDataStatusElem);
    if (!teamWebImportToggle.checked && methodSelector.value === 'raw') {
        sendLocalFile('teams');
    } else {
        nodecg.sendMessage(
            'getTournamentData',
            {
                method: methodSelector.value,
                id: document.getElementById('tournament-id-input').value,
            },
            (e, result) => {
                if (e) {
                    console.error(e);
                    setImportStatus(IMPORT_STATUS_FAILURE, teamDataStatusElem);
                    return;
                }
                setImportStatus(IMPORT_STATUS_SUCCESS, teamDataStatusElem);
            }
        );
    }
};

const methodData = {
    battlefy: {
        dataTitle: 'Tournament ID',
    },
    smashgg: {
        dataTitle: 'Tournament Slug',
    },
    raw: {
        dataTitle: 'Data URL',
    },
};

methodSelector.addEventListener('change', (e) => {
    const method = e.target.value;

    document.getElementById('tournament-id-input-title').innerText =
        methodData[method].dataTitle;

    const webImportToggleContainer = document.getElementById(
        'team-web-import-toggle-container'
    );
    const localTeamImportContainer = document.getElementById(
        'local-team-input-wrapper'
    );
    const webTournamentImportWrapper = document.getElementById(
        'web-tournament-import-wrapper'
    );

    if (method === 'raw') {
        webImportToggleContainer.style.display = '';
        if (!teamWebImportToggle.checked) {
            localTeamImportContainer.style.display = '';
            webTournamentImportWrapper.style.display = 'none';
        }
    } else {
        webImportToggleContainer.style.display = 'none';
        webTournamentImportWrapper.style.display = '';
        localTeamImportContainer.style.display = 'none';
    }
});

teamWebImportToggle.onclick = (e) => {
    const fileInput = document.getElementById('local-team-input-wrapper');
    const urlInput = document.getElementById('web-tournament-import-wrapper');

    const hiddenElem = e.target.checked ? fileInput : urlInput;
    const shownElem = e.target.checked ? urlInput : fileInput;

    shownElem.style.display = '';
    hiddenElem.style.display = 'none';
};

tournamentData.on('change', (newValue) => {
    document.getElementById('tournament-id-display').innerText =
        newValue.meta.id;
});

const roundWebImportToggle = document.getElementById('round-web-import-toggle');

document.getElementById('round-import-submit').onclick = () => {
    setImportStatus(IMPORT_STATUS_LOADING, roundDataStatusElem);

    if (roundWebImportToggle.checked) {
        const listsURL = document.getElementById('round-input-url-input').value;
        nodecg.sendMessage('getRounds', { url: listsURL }, (e) => {
            if (e) {
                console.error(e);
                setImportStatus(IMPORT_STATUS_FAILURE, roundDataStatusElem);
                return;
            }
            setImportStatus(IMPORT_STATUS_SUCCESS, roundDataStatusElem);
        });
    } else {
        sendLocalFile('rounds');
    }
};

roundWebImportToggle.onclick = (e) => {
    const fileInput = document.getElementById('local-round-input-wrapper');
    const urlInput = document.getElementById('web-file-input-wrapper');

    const hiddenElem = e.target.checked ? fileInput : urlInput;
    const shownElem = e.target.checked ? urlInput : fileInput;

    shownElem.style.display = '';
    hiddenElem.style.display = 'none';
};

const roundImportFileInput = document.getElementById('round-input-file-input');
const teamDataFileInput = document.getElementById('team-input-file-input');

function sendLocalFile(dataType) {
    let fileInput;
    let importStatusElem;

    if (dataType === 'rounds') {
        fileInput = roundImportFileInput;
        importStatusElem = roundDataStatusElem;
    } else if (dataType === 'teams') {
        fileInput = teamDataFileInput;
        importStatusElem = teamDataStatusElem;
    } else {
        throw new Error('Invalid dataType parameter');
    }

    if (!fileInput.files[0]) return;

    let formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('jsonType', dataType);

    fetch('/ipl-overlay-controls/upload-tournament-json', {
        method: 'POST',
        body: formData,
    })
        .then((response) => {
            if (response.status === 200) {
                setImportStatus(IMPORT_STATUS_SUCCESS, importStatusElem);
            } else {
                console.error(`Import failed with status ${response.status}`);
                setImportStatus(IMPORT_STATUS_FAILURE, importStatusElem);
            }
        })
        .catch((e) => {
            console.error(e);
            setImportStatus(IMPORT_STATUS_FAILURE, importStatusElem);
        });
}

const IMPORT_STATUS_SUCCESS = 0;
const IMPORT_STATUS_LOADING = 1;
const IMPORT_STATUS_FAILURE = 2;

const teamDataStatusElem = document.getElementById('team-data-submit-status');

const roundDataStatusElem = document.getElementById('round-data-submit-status');

function setImportStatus(status, elem) {
    var backgroundColor, textColor, text;
    switch (status) {
        case IMPORT_STATUS_SUCCESS:
            backgroundColor = 'var(--green)';
            textColor = 'white';
            text = 'SUCCESS';
            break;
        case IMPORT_STATUS_LOADING:
            backgroundColor = 'var(--yellow)';
            textColor = 'black';
            text = 'LOADING';
            break;
        case IMPORT_STATUS_FAILURE:
            backgroundColor = 'var(--red)';
            textColor = 'white';
            text = 'FAIL';
    }

    elem.style.backgroundColor = backgroundColor;
    elem.style.color = textColor;
    elem.innerText = text;
}
