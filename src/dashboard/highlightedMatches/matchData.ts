import { addChangeReminder, addDots, addSelector, clearSelectors } from '../globalScripts';
import { setImportStatus } from '../importStatus';
import { ImportStatus } from 'types/importStatus';
import { HighlightedMatch, NextTeams, TournamentData } from 'schemas';
import { Match } from 'types/match';

const highlightedMatchData = nodecg.Replicant<HighlightedMatch>('highlightedMatches');
const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');
const nextTeams = nodecg.Replicant<NextTeams>('nextTeams');

const matchDataStatusElem = document.getElementById('match-data-status');
const stageSelectElem = document.getElementById('stage-selector') as HTMLSelectElement;
const matchSelectElem = document.getElementById('match-selector') as HTMLSelectElement;
const getMatchesBtnElem = document.getElementById('get-matches') as HTMLButtonElement;
const setNextMatchBtnElem = document.getElementById('set-next-match-btn') as HTMLButtonElement;

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
document.getElementById('get-matches').onclick = () => {
    setImportStatus(ImportStatus.Loading, matchDataStatusElem);

    const stages: Array<string> = [];  // Array to store stages
    if (stageSelectElem.value === 'AllStages') {
        // If all stages is selected add all the stage ID to the array
        tournamentData.value.meta.stages.forEach(function (value) {
            stages.push(value.id);
        });
    } else {
        stages.push(stageSelectElem.value);  // only add one stageId to the array if one stage is picked
    }

    // Send message to extension
    nodecg.sendMessage('getHighlightedMatches', { stages: stages, provider: tournamentData.value.meta.source }, e => {
        // If we get an error
        if (e) {
            console.error(e);
            setImportStatus(ImportStatus.Failure, matchDataStatusElem);
            return;
        }
        // If we get success
        setImportStatus(ImportStatus.Success, matchDataStatusElem);
    });
};

// When set next match button is pressed
document.getElementById('set-next-match-btn').onclick = () => {
    const selectedMatch = getMatchFromID(matchSelectElem.value);
    if (selectedMatch) {  // if match exists then assign it to the next match rep
        nextTeams.value.teamAInfo = selectedMatch.teamA;
        nextTeams.value.teamBInfo = selectedMatch.teamB;
    }
};

tournamentData.on('change', newValue => {
    clearSelectors('stage-selector');
    if (['Battlefy'].includes(newValue.meta.source)) {
        for (let i = 0; i < newValue.meta.stages.length; i++) {
            const element = newValue.meta.stages[i];
            if (['swiss', 'elimination', 'roundrobin'].includes(element.bracketType)) {  // if bracket type is supported
                // add to drop down
                addSelector(addDots(element.name), 'stage-selector', element.id);
            }
        }
        addSelector('All Brackets', 'stage-selector', 'AllStages');
        // Disable button if tournamentData from unsupported source
        getMatchesBtnElem.disabled = false;
    } else {
        // We the source is not supported then we disable the get matches button
        addSelector('Unsupported Tournament Platform', 'stage-selector', 'n/a');
        getMatchesBtnElem.disabled = true;
    }
});

highlightedMatchData.on('change', newValue => {
    clearSelectors('match-selector');
    if (!newValue || newValue.length < 1) {
        addSelector('No Matches','match-selector', 'n/a');
        teamAName.innerText = '';
        teamBName.innerText = '';
        setNextMatchBtnElem.disabled = true;  // if no matches in array disable button
    } else {
        // fill drop down with matches
        newValue.forEach(function (value) {
            addSelector(addDots(`${value.meta.name}|${value.meta.stageName}`),
                'match-selector',
                value.meta.id);
        });
        teamAName.innerText = addDots(newValue[0].teamA.name);
        teamBName.innerText = addDots(newValue[0].teamB.name);
        setNextMatchBtnElem.disabled = false;
    }
});

matchSelectElem.oninput = function () {
    const selectedMatch = getMatchFromID(matchSelectElem.value);
    if (selectedMatch) {
        teamAName.innerText = selectedMatch.teamA.name;
        teamBName.innerText = selectedMatch.teamB.name;
        setNextMatchBtnElem.disabled = false;
    } else {
        teamAName.innerText = '';
        teamBName.innerText = '';
        setNextMatchBtnElem.disabled = true;
    }
};

addChangeReminder(
    document.querySelectorAll('.next-match-update-warning'),
    setNextMatchBtnElem
);

