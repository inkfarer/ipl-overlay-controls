import { hideElement, showElement } from '../globalScripts';
import { setImportStatus } from '../importStatus';
import { ImportStatus } from 'types/importStatus';
import { PredictionStore, ScoreboardData, TeamScores } from 'schemas';
import { WinningOption } from './types/winningOption';

// Stores data on current winning Option
const winningOption: WinningOption = {
    validOption: false,
    optionIndex: -1,
    optionTitle: ''
};

const predictionStore = nodecg.Replicant<PredictionStore>('predictionStore');
const scoreboardData = nodecg.Replicant<ScoreboardData>('scoreboardData');
const teamScores = nodecg.Replicant<TeamScores>('teamScores');

const autoResolveBtn = document.getElementById('auto-resolve-predictions-btn') as HTMLButtonElement;
const resolveOptionABtn = document.getElementById('resolve-A-predictions-btn') as HTMLButtonElement;
const resolveOptionBBtn = document.getElementById('resolve-B-predictions-btn') as HTMLButtonElement;

const warningMessageElem = document.getElementById('message-warning');
const warningElem = document.getElementById('warning-message-box');

const infoMessageElem = document.getElementById('message-info');
const infoElem = document.getElementById('info-message-box');

const predictionPatchStatusElem = document.getElementById('prediction-patch-status');

/**
 * Set disabled pram of all buttons
 * @param disabled
 */
function setBtnDisable(disabled: boolean){
    autoResolveBtn.disabled = disabled;
    resolveOptionABtn.disabled = disabled;
    resolveOptionBBtn.disabled = disabled;
}

/**
 * Sets the button UI
 * @param predictionValue value of predictionStore
 */
function setUI(predictionValue:PredictionStore){
    setBtnDisable(false);
    hideElement(warningElem);
    hideElement(infoElem);
    // If auto resolve data is available
    if(winningOption.validOption){
        autoResolveBtn.innerText = `Auto Resolve: ${winningOption.optionTitle}`;
        autoResolveBtn.disabled = false;
        hideElement(infoElem);
    }else{
        autoResolveBtn.innerText = 'Auto Resolve: ?';
        autoResolveBtn.disabled = true;
        showElement(infoElem);
        infoMessageElem.innerText = 'Unable to workout winning prediction option automatically';
    }
    // Set manual resolve field text
    resolveOptionABtn.innerText = predictionValue.currentPrediction.outcomes[0].title;
    resolveOptionBBtn.innerText = predictionValue.currentPrediction.outcomes[1].title;
    // lock buttons if status is not LOCKED
    if(predictionValue.currentPrediction.status !== 'LOCKED'){
        showElement(infoElem);
        infoMessageElem.innerText = 'Prediction is not in a state that can be resolved';
        setBtnDisable(true);
    }
}

/**
 * Attempt to work out which team is winning and if there's a prediction option to resolve in ether's favour
 * @param teamScoresValue teamScores replicant Value
 * @param scoreboardValue scoreboardData replicant value
 * @param predictionValue predictionStore replicant value
 */
function autoResolveWinner(teamScoresValue: TeamScores,
    scoreboardValue: ScoreboardData, predictionValue:PredictionStore){
    winningOption.validOption = false;
    let winningTeamName: string;
    // Work out which team has higher score
    if(teamScoresValue.teamA > teamScoresValue.teamB){
        winningTeamName = scoreboardValue.teamAInfo.name;
    }else if(teamScoresValue.teamB > teamScoresValue.teamA){
        winningTeamName = scoreboardValue.teamBInfo.name;
    }else{  // if neither team is in the lead
        setUI(predictionValue);
        return;
    }
    for(let i = 0; i < 2; i++){  // for each possible outcome
        // If the name of the winning team matches one of the teams in the outcomes' titles
        if(winningTeamName.toUpperCase() === predictionValue.currentPrediction.outcomes[i].title.toUpperCase()){
            winningOption.optionTitle = predictionValue.currentPrediction.outcomes[i].title;
            winningOption.optionIndex = i;
            winningOption.validOption = true;
            setUI(predictionValue);
            return;
        }
    }
}

/**
 * Run prediction resolve
 * @param index index of winning outcome
 */
function resolvePrediction(index: number){
    if(!predictionStore.value.currentPrediction.id || index > 1 || index < 0){
        // if no id (aka no prediction) don't event attempt to patch prediction
        setImportStatus(ImportStatus.Failure, predictionPatchStatusElem);
        warningMessageElem.innerText = 'No outcomes/prediction to resolve >.<';
        showElement(warningElem);
        return;
    }
    hideElement(warningElem);  // Hide an errors if we're showing any
    setImportStatus(ImportStatus.Loading, predictionPatchStatusElem);
    nodecg.sendMessage('patchPrediction', {
        id: predictionStore.value.currentPrediction.id,
        status: 'RESOLVED',
        winning_outcome_id: predictionStore.value.currentPrediction.outcomes[index].id
    }, (e) => {
        if(e){
            console.error(e);
            setImportStatus(ImportStatus.Failure, predictionPatchStatusElem);
            warningMessageElem.innerText = e.detail.message;
            showElement(warningElem);
            return;
        }
        setImportStatus(ImportStatus.Success, predictionPatchStatusElem);
    });
}

NodeCG.waitForReplicants(predictionStore, teamScores, scoreboardData).then(() => {
    predictionStore.on('change', newValue => {
        autoResolveWinner(teamScores.value, scoreboardData.value, newValue);
        setUI(newValue);
    });

    teamScores.on('change', newValue => {
        autoResolveWinner(newValue, scoreboardData.value, predictionStore.value);
        setUI(predictionStore.value);
    });

});

// Assign onclick functions to buttons
autoResolveBtn.onclick = () => {resolvePrediction(winningOption.optionIndex);};
resolveOptionABtn.onclick = () => {resolvePrediction(0);};
resolveOptionBBtn.onclick = () => {resolvePrediction(1);};