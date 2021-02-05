const tournamentData = nodecg.Replicant('tourneyData');

document.getElementById('submit-import').onclick = () => {
    setImportStatus(IMPORT_STATUS_LOADING);
    nodecg.sendMessage(
        'getTourneyData',
        {
            method: document.getElementById('method-selector').value,
            id: document.getElementById('tournament-id-input').value,
        },
        (e, result) => {
            if (e) {
                console.error(e);
                setImportStatus(IMPORT_STATUS_FAILURE);
                return;
            }
            setImportStatus(IMPORT_STATUS_SUCCESS);
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

const IMPORT_STATUS_SUCCESS = 0;
const IMPORT_STATUS_LOADING = 1;
const IMPORT_STATUS_FAILURE = 2;

function setImportStatus(status) {
    const statusElem = document.getElementById('submit-status');
    var backgroundColor, textColor, text;
    switch (status) {
        case IMPORT_STATUS_SUCCESS:
            backgroundColor = 'var(--green)';
            textColor = 'white';
            text = 'SUCCESS';
            return;
        case IMPORT_STATUS_LOADING:
            backgroundColor = 'var(--yellow)';
            textColor = 'black';
            text = 'LOADING';
            return;
        case IMPORT_STATUS_FAILURE:
            backgroundColor = 'var(--red)';
            textColor = 'white';
            text = 'FAIL';
    }

    statusElem.style.backgroundColor = backgroundColor;
    statusElem.style.color = textColor;
    statusElem.innerText = text;
}
