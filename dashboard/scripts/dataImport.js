const tournamentData = nodecg.Replicant('tournamentData');

document.getElementById('submit-import').onclick = () => {
    setImportStatus(IMPORT_STATUS_LOADING, teamDataStatusElem);
    nodecg.sendMessage(
        'getTournamentData',
        {
            method: document.getElementById('method-selector').value,
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

document.getElementById('method-selector').addEventListener('change', (e) => {
    document.getElementById('tournament-id-input-title').innerText =
        methodData[e.target.value].dataTitle;
});

tournamentData.on('change', (newValue) => {
    document.getElementById('tournament-id-display').innerText =
        newValue.meta.id;
});

document.getElementById('round-import-submit').onclick = () => {
    setImportStatus(IMPORT_STATUS_LOADING, roundDataStatusElem);
    const listsURL = document.getElementById('round-input-url-input').value;

    nodecg.sendMessage('getRounds', { url: listsURL }, (e) => {
        if (e) {
            console.error(e);
            setImportStatus(IMPORT_STATUS_FAILURE, roundDataStatusElem);
            return;
        }
        setImportStatus(IMPORT_STATUS_SUCCESS, roundDataStatusElem);
    });
};

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
