import { addChangeReminder, fillList } from '../globalScripts';
import { ActiveRoundId, Game, GameData, Rounds } from 'schemas';

import './setWinnersAutomatically';
import './buttonColors';

import '../styles/globalStyles.css';
import './currentRound.css';
import { splatModes, splatStages } from '../../helpers/splatoonData';
import { GameWinner } from 'types/gameWinner';
import { createEmptyGameData } from '../../helpers/gameDataHelper';

const gameData = nodecg.Replicant<GameData>('gameData');
const activeRoundId = nodecg.Replicant<ActiveRoundId>('activeRoundId');
const rounds = nodecg.Replicant<Rounds>('rounds');

const roundNameElem = document.getElementById('round-name');
const roundUpdateButton = document.getElementById('update-round') as HTMLButtonElement;

NodeCG.waitForReplicants(gameData, rounds)
    .then(() => {
        activeRoundId.on('change', newValue => {
            const currentRound = rounds.value[newValue];

            if (currentRound) {
                addRoundToggles(currentRound.games, currentRound.meta.name);
            } else {
                removeToggles();
                roundNameElem.innerText =
                    'Undefined (Round might have been deleted...)';
            }
        });

        gameData.on('change', (newValue, oldValue) => {
            if (!oldValue || newValue.length === oldValue.length) {
                disableWinButtons(newValue);
            }
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
                    newGame.mode !== oldGame.mode ||
                    oldGame.stage !== newGame.stage
                ) {
                    updateMapsAndModes(i, newGame);
                    break;
                }
            }
        });
    });

function updateMapsAndModes(index: number, data: Game) {
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
        gameData.value[stageIndex].winner = GameWinner.NO_WINNER;
    };

    AWinButton.onclick = event => {
        const stageIndex = parseInt((event.target as HTMLButtonElement).id.split('_')[1], 10);
        gameData.value[stageIndex].winner = GameWinner.ALPHA;
    };

    BWinButton.onclick = event => {
        const stageIndex = parseInt((event.target as HTMLButtonElement).id.split('_')[1], 10);
        gameData.value[stageIndex].winner = GameWinner.BRAVO;
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
    gameData.value = createEmptyGameData(rounds.value[activeRoundId.value].games.length);
};

function getButtons(id: number): { [key in GameWinner]: HTMLButtonElement } {
    const noWinButton = document.querySelector(`#no-win-toggle_${id}`) as HTMLButtonElement;
    const AWinButton = document.querySelector(`#team-a-win-toggle_${id}`) as HTMLButtonElement;
    const BWinButton = document.querySelector(`#team-b-win-toggle_${id}`) as HTMLButtonElement;
    return {
        [GameWinner.NO_WINNER]: noWinButton,
        [GameWinner.ALPHA]: AWinButton,
        [GameWinner.BRAVO]: BWinButton
    };
}

function disableWinButtons(gameData: GameData) {
    for (let i = 0; i < gameData.length; i++) {
        const gameWinner = gameData[i].winner;
        const buttons = getButtons(i);
        Object.values(buttons)
            .forEach(button => {
                button.disabled = false;
            });

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
