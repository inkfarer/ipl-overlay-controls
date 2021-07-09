import { addChangeReminder, fillList } from '../globalScripts';
import { ActiveRoundId, Game, GameWinners, Rounds, ScoreboardData } from 'schemas';

import './setWinnersAutomatically';

import '../styles/globalStyles.css';
import './currentRound.css';
import { splatModes, splatStages } from '../../helpers/splatoonData';

const gameWinners = nodecg.Replicant<GameWinners>('gameWinners');
const activeRoundId = nodecg.Replicant<ActiveRoundId>('activeRoundId');
const rounds = nodecg.Replicant<Rounds>('rounds');
const scoreboardData = nodecg.Replicant<ScoreboardData>('scoreboardData');

const roundNameElem = document.getElementById('round-name');
const roundUpdateButton = document.getElementById('update-round') as HTMLButtonElement;

NodeCG.waitForReplicants(gameWinners, rounds).then(() => {
    activeRoundId.on('change', newValue => {
        const currentRound = rounds.value[newValue];

        if (currentRound) {
            addRoundToggles(currentRound.games, currentRound.meta.name);
        } else {
            removeToggles();
            roundNameElem.innerText
                = 'Undefined (Round might have been deleted...)';
        }
    });

    gameWinners.on('change', newValue => {
        disableWinButtons(newValue);
    });

    rounds.on('change', (newValue, oldValue) => {
        if (!oldValue) return;

        const newCurrentRound = newValue[activeRoundId.value];
        const oldCurrentRound = oldValue[activeRoundId.value];

        if (!newCurrentRound) return;

        if (newCurrentRound.meta.name !== oldCurrentRound.meta.name) {
            roundNameElem.innerText = newCurrentRound.meta.name;
        }

        for (let i = 0; i < newCurrentRound.games.length; i++) {
            const newGame = newCurrentRound.games[i];
            const oldGame = oldCurrentRound.games[i];

            if (
                newGame.mode !== oldGame.mode
                || oldGame.stage !== newGame.stage
            ) {
                updateMapsModes(i, newGame);
                break;
            }
        }
    });
});

scoreboardData.on('change', newValue => {
    document.body.style.setProperty(
        '--team-a-color',
        newValue.swapColorOrder ? newValue.colorInfo.clrB : newValue.colorInfo.clrA);
    document.body.style.setProperty(
        '--team-b-color',
        newValue.swapColorOrder ? newValue.colorInfo.clrA : newValue.colorInfo.clrB);
    document.body.style.setProperty(
        '--team-a-text-color',
        getTextColor(newValue.swapColorOrder ? newValue.colorInfo.clrB : newValue.colorInfo.clrA));
    document.body.style.setProperty(
        '--team-b-text-color',
        getTextColor(newValue.swapColorOrder ? newValue.colorInfo.clrA : newValue.colorInfo.clrB));
});

function getTextColor(hex: string): string {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#333' : 'white';
}

function updateMapsModes(index: number, data: Game) {
    const stageSelector = document.getElementById(`stage-selector_${index}`) as HTMLSelectElement;
    stageSelector.value = data.stage;

    const modeSelector = document.getElementById(`mode-selector_${index}`) as HTMLSelectElement;
    modeSelector.value = data.mode;
}

function addRoundToggles(games: Game[], roundName: string) {
    removeToggles();
    roundNameElem.innerText = roundName;
    for (let i = 0; i < games.length; i++) {
        const element = games[i];
        addToggle(element, i);
    }
}

function addToggle(roundElement: Game, stageIndex: number) {
    const toggleDiv = document.createElement('div');
    toggleDiv.classList.add('toggles');
    const stageModeDisplay = document.createElement('div');

    stageModeDisplay.innerHTML = `<div class="separator"><span>${
        Number(stageIndex) + 1
    }</span></div>`;
    toggleDiv.appendChild(stageModeDisplay);

    const reminderCreatingElements = [];
    const stageSelector = document.createElement('select');
    stageSelector.id = `stage-selector_${stageIndex}`;
    stageSelector.classList.add('stage-selector');
    fillList(stageSelector, splatStages);
    stageSelector.value = roundElement.stage;
    toggleDiv.appendChild(stageSelector);
    reminderCreatingElements.push(stageSelector);

    const modeSelector = document.createElement('select');
    modeSelector.id = `mode-selector_${stageIndex}`;
    modeSelector.classList.add('mode-selector');
    fillList(modeSelector, splatModes);
    modeSelector.value = roundElement.mode;
    toggleDiv.appendChild(modeSelector);
    reminderCreatingElements.push(modeSelector);

    addChangeReminder(reminderCreatingElements, roundUpdateButton);

    const noWinButton = document.createElement('button');
    noWinButton.classList.add('no-win-toggle');
    noWinButton.classList.add('max-width');
    noWinButton.classList.add('red');
    noWinButton.id = 'no-win-toggle_' + stageIndex;
    noWinButton.innerText = '✖';
    noWinButton.disabled = true;

    const AWinButton = document.createElement('button');
    AWinButton.classList.add('team-a-win-toggle');
    AWinButton.classList.add('max-width');
    AWinButton.id = 'team-a-win-toggle_' + stageIndex;
    AWinButton.innerText = 'A';

    const BWinButton = document.createElement('button');
    BWinButton.classList.add('team-b-win-toggle');
    BWinButton.classList.add('max-width');
    BWinButton.id = 'team-b-win-toggle_' + stageIndex;
    BWinButton.innerText = 'B';

    noWinButton.onclick = event => {
        const stageIndex = parseInt((event.target as HTMLButtonElement).id.split('_')[1], 10);
        gameWinners.value[stageIndex] = 0;
    };

    AWinButton.onclick = event => {
        const stageIndex = parseInt((event.target as HTMLButtonElement).id.split('_')[1], 10);
        gameWinners.value[stageIndex] = 1;
    };

    BWinButton.onclick = event => {
        const stageIndex = parseInt((event.target as HTMLButtonElement).id.split('_')[1], 10);
        gameWinners.value[stageIndex] = 2;
    };

    const winButtonContainer = document.createElement('div');
    winButtonContainer.classList.add('layout');
    winButtonContainer.classList.add('horizontal');
    winButtonContainer.classList.add('win-button-container');
    winButtonContainer.appendChild(noWinButton);
    winButtonContainer.appendChild(AWinButton);
    winButtonContainer.appendChild(BWinButton);
    toggleDiv.appendChild(winButtonContainer);

    document.getElementById('toggles')
        .appendChild(toggleDiv);
}

document.getElementById('reset-btn').onclick = () => {
    gameWinners.value = [0, 0, 0, 0, 0, 0, 0];
};

function getButtons(id: number): HTMLButtonElement[] {
    const noWinButton = document.querySelector('#no-win-toggle_' + id) as HTMLButtonElement;
    const AWinButton = document.querySelector('#team-a-win-toggle_' + id) as HTMLButtonElement;
    const BWinButton = document.querySelector('#team-b-win-toggle_' + id) as HTMLButtonElement;
    return [noWinButton, AWinButton, BWinButton];
}

function disableWinButtons(gameWinnerValue: number[]) {
    const currentRound = rounds.value[activeRoundId.value];

    for (let i = 1; i < currentRound.games.length + 1; i++) {
        const gameWinner = gameWinnerValue[i - 1];
        const buttons = getButtons(i - 1);
        for (let y = 0; y < buttons.length; y++) {
            buttons[y].disabled = false;
        }

        buttons[gameWinner].disabled = true;
    }
}

function removeToggles() {
    document.getElementById('toggles').innerHTML = '';
}

roundUpdateButton.addEventListener('click', () => {
    const numberOfGames = rounds.value[activeRoundId.value].games.length;
    const games = [];

    for (let i = 0; i < numberOfGames; i++) {
        const currentGame = {
            stage: '',
            mode: ''
        };
        const stageSelector = document.getElementById(`stage-selector_${i}`) as HTMLSelectElement;
        currentGame.stage = stageSelector.value;

        const modeSelector = document.getElementById(`mode-selector_${i}`) as HTMLSelectElement;
        currentGame.mode = modeSelector.value;
        games.push(currentGame);
    }

    rounds.value[activeRoundId.value].games = games;
});
