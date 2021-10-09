import { TournamentData } from 'schemas';
import { setImportStatus } from '../helpers/importStatusHelper';
import { ImportStatus } from 'types/enums/importStatus';
import { sendLocalFile } from './postData';
import { TournamentDataSource, TournamentDataSourceHelper } from 'types/enums/tournamentDataSource';
import { dispatch, elementById, hideElement, showElement } from '../helpers/elemHelper';
import { addSelector, clearSelectors } from '../helpers/selectHelper';
import { GetTournamentDataResponse } from 'types/messages/tournamentData';
import isEmpty from 'lodash/isEmpty';

const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');

const teamWebImportToggle = document.getElementById('team-web-import-toggle') as HTMLInputElement;
const methodSelector = document.getElementById('method-selector') as HTMLSelectElement;
const teamDataFileInput = document.getElementById('team-input-file-input') as HTMLInputElement;
const teamDataStatusElem = document.getElementById('team-data-submit-status');
const smashggEventSelectWrapper = elementById('smashgg-event-select-wrapper');
const smashggEventSelect = elementById<HTMLSelectElement>('smashgg-event-select');

const methodData: { [key in TournamentDataSource]: { dataTitle: string } } = {
    [TournamentDataSource.BATTLEFY]: {
        dataTitle: 'Tournament ID'
    },
    [TournamentDataSource.SMASHGG]: {
        dataTitle: 'Tournament Slug'
    },
    [TournamentDataSource.UPLOAD]: {
        dataTitle: 'Data URL'
    },
    [TournamentDataSource.UNKNOWN]: {
        dataTitle: '???'
    }
};

methodSelector.addEventListener('change', e => {
    const method = (e.target as HTMLSelectElement).value as TournamentDataSource;
    if (isEmpty(method)) return;

    document.getElementById('tournament-id-input-title').innerText = methodData[method].dataTitle;

    const webImportToggleContainer = document.getElementById('team-web-import-toggle-container');
    const localTeamImportContainer = document.getElementById('local-team-input-wrapper');
    const webTournamentImportWrapper = document.getElementById('web-tournament-import-wrapper');

    if (method === TournamentDataSource.UPLOAD) {
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

    if (method === TournamentDataSource.SMASHGG && smashggEventSelect.options.length > 1) {
        showElement(smashggEventSelectWrapper);
    } else {
        hideElement(smashggEventSelectWrapper);
    }
});

document.getElementById('submit-import').addEventListener('click', () => {
    setImportStatus(ImportStatus.LOADING, teamDataStatusElem);
    if (!teamWebImportToggle.checked && methodSelector.value === TournamentDataSource.UPLOAD) {
        sendLocalFile('teams', teamDataFileInput, teamDataStatusElem);
    } else {
        nodecg.sendMessage(
            'getTournamentData', {
                method: methodSelector.value,
                id: (document.getElementById('tournament-id-input') as HTMLInputElement).value
            }, (e, result: GetTournamentDataResponse) => {
                if (e) {
                    console.error(e);
                    setImportStatus(ImportStatus.FAILURE, teamDataStatusElem);
                    return;
                }

                if (result.events && result.events.length > 1) {
                    showElement(smashggEventSelectWrapper);
                    elementById('smashgg-event-select-label').textContent = `Event (Tournament: ${result.id})`;
                    clearSelectors('smashgg-event-select');
                    result.events.forEach(event => {
                        addSelector(`${event.name} (${event.game})`, 'smashgg-event-select', event.id.toString(10));
                    });
                } else {
                    clearSelectors('smashgg-event-select');
                    hideElement(smashggEventSelectWrapper);
                }

                setImportStatus(ImportStatus.SUCCESS, teamDataStatusElem);
            });
    }
});

teamWebImportToggle.addEventListener('click', e => {
    const fileInput = document.getElementById('local-team-input-wrapper') as HTMLInputElement;
    const urlInput = document.getElementById('web-tournament-import-wrapper') as HTMLInputElement;

    const hiddenElem = (e.target as HTMLInputElement).checked ? fileInput : urlInput;
    const shownElem = (e.target as HTMLInputElement).checked ? urlInput : fileInput;

    shownElem.style.display = '';
    hiddenElem.style.display = 'none';
});

tournamentData.on('change', newValue => {
    document.getElementById('tournament-name').innerText = newValue.meta.name || 'No Name';
    methodSelector.value = newValue.meta.source;
    dispatch(methodSelector, 'change');

    const formattedSource = TournamentDataSourceHelper.toPrettyString(newValue.meta.source as TournamentDataSource);
    let tournamentId = `${newValue.meta.id} (${formattedSource})`;

    if (newValue.meta.source === TournamentDataSource.SMASHGG) {
        const smashggData = newValue.meta.sourceSpecificData.smashgg;
        tournamentId += `\n${smashggData.eventData.name} (${smashggData.eventData.game})`;
    }

    document.getElementById('tournament-id').innerText = tournamentId;
});

elementById('smashgg-event-submit').addEventListener('click', () => {
    setImportStatus(ImportStatus.LOADING, teamDataStatusElem);
    nodecg.sendMessage('getSmashggEvent', { eventId: parseInt(smashggEventSelect.value) }, e => {
        if (e) {
            console.error(e);
            setImportStatus(ImportStatus.FAILURE, teamDataStatusElem);
            return;
        }

        setImportStatus(ImportStatus.SUCCESS, teamDataStatusElem);
    });
});
