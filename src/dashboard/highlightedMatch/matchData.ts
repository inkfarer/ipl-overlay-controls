import {setImportStatus} from '../globalScripts';
import {ImportStatus} from 'types/importStatus';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { HighlightedMatch, TournamentData } from 'schemas';

// const highlightedMatchData = nodecg.Replicant<HighlightedMatch>('highlighedMatches');
const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');

const matchDataStatusElem = document.getElementById('match-data-status');
const stageSelectElem = document.getElementById('stage-selector') as HTMLSelectElement;

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
