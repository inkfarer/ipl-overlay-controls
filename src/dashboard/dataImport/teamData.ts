import { TournamentData } from 'schemas';
import { setImportStatus } from './importStatus';
import { ImportStatus } from 'types/importStatus';
import { sendLocalFile } from './postData';

const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');

const teamWebImportToggle = document.getElementById('team-web-import-toggle') as HTMLInputElement;
const methodSelector = document.getElementById('method-selector') as HTMLSelectElement;
const teamDataFileInput = document.getElementById('team-input-file-input') as HTMLInputElement;
const teamDataStatusElem = document.getElementById('team-data-submit-status');

const methodData: { [key: string]: { dataTitle: string } } = {
    battlefy: {
        dataTitle: 'Tournament ID'
    },
    smashgg: {
        dataTitle: 'Tournament Slug'
    },
    raw: {
        dataTitle: 'Data URL'
    }
};

methodSelector.addEventListener('change', e => {
    const method = (e.target as HTMLSelectElement).value;

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

document.getElementById('submit-import').onclick = () => {
    setImportStatus(ImportStatus.Loading, teamDataStatusElem);
    if (!teamWebImportToggle.checked && methodSelector.value === 'raw') {
        sendLocalFile('teams', teamDataFileInput, teamDataStatusElem);
    } else {
        nodecg.sendMessage(
            'getTournamentData',
            {
                method: methodSelector.value,
                id: (document.getElementById('tournament-id-input') as HTMLInputElement).value
            },
            e => {
                if (e) {
                    console.error(e);
                    setImportStatus(ImportStatus.Failure, teamDataStatusElem);
                    return;
                }

                setImportStatus(ImportStatus.Success, teamDataStatusElem);
            }
        );
    }
};

teamWebImportToggle.onclick = e => {
    const fileInput = document.getElementById('local-team-input-wrapper') as HTMLInputElement;
    const urlInput = document.getElementById('web-tournament-import-wrapper') as HTMLInputElement;

    const hiddenElem = (e.target as HTMLInputElement).checked ? fileInput : urlInput;
    const shownElem = (e.target as HTMLInputElement).checked ? urlInput : fileInput;

    shownElem.style.display = '';
    hiddenElem.style.display = 'none';
};

tournamentData.on('change', newValue => {
    document.getElementById('tournament-name').innerText = newValue.meta.name || 'No Name';
    document.getElementById('tournament-id').innerText = `${newValue.meta.id} (${newValue.meta.source})`;
});
