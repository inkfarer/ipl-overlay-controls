import { addChangeReminder, addDots, addSelector, clearSelectors, hideElement, showElement } from '../globalScripts';
import { setImportStatus } from '../importStatus';
import { ImportStatus } from 'types/importStatus';
import { HighlightedMatches, NextTeams, TournamentData } from 'schemas';
import { Match } from 'types/match';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import { BracketType } from 'types/enums/bracketType';

const highlightedMatchData = nodecg.Replicant<HighlightedMatches>('highlightedMatches');
const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');
const nextTeams = nodecg.Replicant<NextTeams>('nextTeams');

const matchDataStatusElem = document.getElementById('match-data-status');
const stageSelectElem = document.getElementById('stage-selector') as MultiSelect;
const matchSelectElem = document.getElementById('match-selector') as HTMLSelectElement;
const setNextMatchBtnElem = document.getElementById('set-next-match-btn') as HTMLButtonElement;
const getMatchesBtn = document.getElementById('get-matches') as HTMLButtonElement;

const unsupportedPlatformWarning = document.getElementById('unsupported-service-message');
const noLoadedMatchesMessage = document.getElementById('load-matches-hint');
const loadMatchesSpace = document.getElementById('load-matches-space');
const selectMatchSpace = document.getElementById('select-match-space');

const teamAName = document.getElementById('team-a-name');
const teamBName = document.getElementById('team-b-name');

/**
 * Gets match from matchID
 * @param id the ID of the match
 */
function getMatchFromID(id: string): Match | null {
    for (let x = 0; x < highlightedMatchData.value.length; x++) {
        const value = highlightedMatchData.value[x];
        if (value.meta.id === id) {
            return value;
        }
    }
}

// When get match button is pressed
getMatchesBtn.onclick = () => {
    setImportStatus(ImportStatus.Loading, matchDataStatusElem);
    const selectedStages: string[] = stageSelectElem.selectedOptions.map(option => { return option.value; });

    // Send message to extension
    nodecg.sendMessage('getHighlightedMatches', {
        stages: selectedStages,
        getAllStages: selectedStages.includes('AllStages')
    }, (e, result) => {
        // If we get an error
        if (e) {
            console.error(e);
            setImportStatus(ImportStatus.Failure, matchDataStatusElem);
            return;
        }
        // If we get success
        setImportStatus(result.status, matchDataStatusElem);
    });
};

stageSelectElem.addEventListener('change', event => {
    getMatchesBtn.disabled = (event.target as MultiSelect).selectedOptions.length < 1;
});

// When set next match button is pressed
setNextMatchBtnElem.onclick = () => {
    const selectedMatch = getMatchFromID(matchSelectElem.value);
    if (selectedMatch) {  // if match exists then assign it to the next match rep
        nextTeams.value.teamAInfo = selectedMatch.teamA;
        nextTeams.value.teamBInfo = selectedMatch.teamB;
    }
};

tournamentData.on('change', newValue => {
    clearSelectors('stage-selector');
    if (isValidSource(newValue.meta.source)) {
        showElement(loadMatchesSpace);
        hideElement(unsupportedPlatformWarning);

        for (let i = 0; i < newValue.stages.length; i++) {
            const element = newValue.stages[i];
            if ([BracketType.SWISS,
                BracketType.DOUBLE_ELIMINATION,
                BracketType.SINGLE_ELIMINATION,
                BracketType.ROUND_ROBIN].includes(element.type as BracketType)) {

                // if bracket type is supported, add to drop down
                addSelector(addDots(element.name), 'stage-selector', element.id);
            }
        }
        addSelector('All Brackets', 'stage-selector', 'AllStages');
    } else {
        hideElement(loadMatchesSpace);
        showElement(unsupportedPlatformWarning);
        hideElement(noLoadedMatchesMessage);
    }
});

highlightedMatchData.on('change', newValue => {
    clearSelectors('match-selector');
    if (!newValue || newValue.length < 1) {
        hideElement(selectMatchSpace);
        if (isValidSource(tournamentData.value.meta.source)) {
            showElement(noLoadedMatchesMessage);
        }
    } else {
        hideElement(noLoadedMatchesMessage);
        showElement(selectMatchSpace);

        const isSameBracket = newValue.every(value => {
            return value.meta.stageName === newValue[0].meta.stageName;
        });

        // fill drop down with matches
        newValue.forEach(function (value) {
            const matchName = isSameBracket ? value.meta.name : `${value.meta.name} | ${value.meta.stageName}`;
            addSelector(
                addDots(matchName),
                'match-selector',
                value.meta.id);
        });
        teamAName.innerText = addDots(newValue[0].teamA.name);
        teamBName.innerText = addDots(newValue[0].teamB.name);
    }
});

matchSelectElem.oninput = function () {
    const selectedMatch = getMatchFromID(matchSelectElem.value);
    if (selectedMatch) {
        teamAName.innerText = selectedMatch.teamA.name;
        teamBName.innerText = selectedMatch.teamB.name;
        setNextMatchBtnElem.disabled = false;
    } else {
        teamAName.innerText = 'Unknown';
        teamBName.innerText = 'Unknown';
        setNextMatchBtnElem.disabled = true;
    }
};

addChangeReminder(document.querySelectorAll('.next-match-update-warning'), setNextMatchBtnElem);

function isValidSource(source: string): boolean {
    return [TournamentDataSource.BATTLEFY].includes(source as TournamentDataSource);
}
