import {addDots, addSelector, clearSelectors, setImportStatus} from '../globalScripts';
import {ImportStatus} from 'types/importStatus';
import {HighlightedMatch, NextTeams, TournamentData} from 'schemas';
import {Match} from './Match';

const highlightedMatchData = nodecg.Replicant<HighlightedMatch>('highlighedMatches');
const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');
const nextTeams = nodecg.Replicant<NextTeams>('nextTeams');

const matchDataStatusElem = document.getElementById('match-data-status');
const stageSelectElem = document.getElementById('stage-selector') as HTMLSelectElement;
const matchSelectElem = document.getElementById('match-selector') as HTMLSelectElement;

const teamAName = document.getElementById('team-a-name');
const teamBName = document.getElementById('team-b-name');

document.getElementById('get-matches').onclick = () => {
    setImportStatus(ImportStatus.Loading, matchDataStatusElem);

    const stages: Array<string> = [];
    if (stageSelectElem.value === 'AllStages') {
        tournamentData.value.meta.stages.forEach(function (value) {
            stages.push(value.id);
        });
    } else {
        stages.push(stageSelectElem.value);
    }

    nodecg.sendMessage('getHighlightedMatches',
        {
            stages: stages,
            provider: tournamentData.value.meta.source
        },
        e => {
            if (e) {
                console.error(e);
                setImportStatus(ImportStatus.Failure, matchDataStatusElem);
                return;
            }

            setImportStatus(ImportStatus.Success, matchDataStatusElem);
        }
    );
};

document.getElementById('set-next-match-btn').onclick = () => {
    const selectedMatch = getMatchFromID(matchSelectElem.value);
    if (selectedMatch) {
        nextTeams.value.teamAInfo = selectedMatch.teamA;
        nextTeams.value.teamBInfo = selectedMatch.teamB;
    }
};

tournamentData.on('change', newValue => {
    clearSelectors('stage-selector');
    for (let i = 0; i < newValue.meta.stages.length; i++) {
        const element = newValue.meta.stages[i];
        if (['swiss', 'elimination'].includes(element.bracketType)) {
            addSelector(addDots(element.name), 'stage-selector', element.id);
        }
    }
    addSelector('All Brackets', 'stage-selector', 'AllStages');
});

highlightedMatchData.on('change', newValue => {
    clearSelectors('match-selector');
    newValue.forEach(function (value) {
        addSelector(addDots(`${value.meta.name}|${value.meta.stageName}`),
            'match-selector',
            value.meta.id);
    });
    teamAName.innerHTML = newValue[0].teamA.name;
    teamBName.innerHTML = newValue[0].teamB.name;
});

function getMatchFromID(id: string): Match | void {
    for (let x = 0; x < highlightedMatchData.value.length; x++) {
        const value = highlightedMatchData.value[x];
        if (value.meta.id === id) {
            return value;
        }
    }
}

matchSelectElem.oninput = function () {
    const selectedMatch = getMatchFromID(matchSelectElem.value);
    if (selectedMatch) {
        teamAName.innerHTML = selectedMatch.teamA.name;
        teamBName.innerHTML = selectedMatch.teamB.name;
    }
};
