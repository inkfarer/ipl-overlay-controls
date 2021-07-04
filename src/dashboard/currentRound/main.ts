import { addChangeReminder, addClasses, fillList } from '../globalScripts';
import { ActiveRoundId, Game, GameData, Rounds, ScoreboardData, SwapColorsInternally } from 'schemas';

import './setWinnersAutomatically';
import './buttonColors';

import '../styles/globalStyles.css';
import './currentRound.css';
import { splatModes, splatStages } from '../../helpers/splatoonData';
import { GameWinner } from 'types/gameWinner';
import { getContrastingTextColor } from './colorHelper';
import { fillColorSelector, getColorOptionName } from '../helpers/colorHelper';
import { createEmptyGameData } from '../../helpers/gameDataHelper';

const gameData = nodecg.Replicant<GameData>('gameData');
const activeRoundId = nodecg.Replicant<ActiveRoundId>('activeRoundId');
const rounds = nodecg.Replicant<Rounds>('rounds');
const scoreboardData = nodecg.Replicant<ScoreboardData>('scoreboardData');
const swapColorsInternally = nodecg.Replicant<SwapColorsInternally>('swapColorsInternally');

const roundNameElem = document.getElementById('round-name');
const roundUpdateButton = document.getElementById('update-round') as HTMLButtonElement;
const enableColorEditToggle = document.getElementById('enable-color-edit-toggle') as HTMLInputElement;

NodeCG.waitForReplicants(gameData, rounds).then(() => {
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
        updateColorData(newValue);
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

            if (newGame.mode !== oldGame.mode || oldGame.stage !== newGame.stage) {
                updateMapsAndModes(i, newGame);
                break;
            }
        }
    });
});

enableColorEditToggle.addEventListener('change', e => {
    const colorSelectors = document.querySelectorAll('.color-selector-wrapper') as NodeListOf<HTMLDivElement>;
    colorSelectors.forEach(selector => {
        selector.style.display = (e.target as HTMLInputElement).checked ? '' : 'none';
    });
});

swapColorsInternally.on('change', (newValue, oldValue) => {
    if (oldValue && oldValue === newValue) {
        updateColorData(gameData.value);
    }
});

scoreboardData.on('change', (newValue, oldValue) => {
    if (oldValue) {
        updateColorData(gameData.value);
    }
});

function updateColorData(gameData: GameData) {
    for (let i = 0; i < gameData.length; i++) {
        const dataElem = gameData[i];

        const gameEditor = document.getElementById(`game-editor_${i}`);
        const colorSelect = gameEditor.querySelector('.color-selector') as HTMLSelectElement;
        const colorSwapToggle = gameEditor.querySelector('.color-swap-toggle') as HTMLInputElement;

        if (dataElem.color) {
            if (colorSelect.dataset.source !== 'gameInfo-edited') {
                updateButtonColors(i, dataElem.color.clrA, dataElem.color.clrB);
                colorSelect.value = getColorOptionName(dataElem.color, dataElem.color.categoryName);
                colorSelect.dataset.source = 'gameInfo';
                colorSwapToggle.checked = dataElem.color.colorsSwapped;
                colorSwapToggle.dataset.source = 'gameInfo';
            }
        } else {
            if (colorSelect.dataset.source !== 'gameInfo-edited') {
                removeCustomButtonColors(i);
                colorSelect.value = getColorOptionName(scoreboardData.value.colorInfo,
                    scoreboardData.value.colorInfo.categoryName);
                colorSelect.dataset.source = 'scoreboard';
                colorSwapToggle.checked = swapColorsInternally.value;
                colorSwapToggle.dataset.source = 'scoreboard';
            }
        }
    }
}

function updateButtonColors(index: number, clrA: string, clrB: string): void {
    const buttons = getButtons(index);
    buttons[GameWinner.ALPHA].style.backgroundColor = clrA;
    buttons[GameWinner.ALPHA].style.color = getContrastingTextColor(clrA);
    buttons[GameWinner.BRAVO].style.backgroundColor = clrB;
    buttons[GameWinner.BRAVO].style.color = getContrastingTextColor(clrB);
}

function removeCustomButtonColors(index: number): void {
    const buttons = getButtons(index);
    buttons[GameWinner.ALPHA].style.removeProperty('background-color');
    buttons[GameWinner.ALPHA].style.removeProperty('color');
    buttons[GameWinner.BRAVO].style.removeProperty('background-color');
    buttons[GameWinner.BRAVO].style.removeProperty('color');
}

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
    toggleDiv.id = `game-editor_${stageIndex}`;
    const stageModeDisplay = document.createElement('div');
    const gameInfo = gameData.value[stageIndex];

    stageModeDisplay.innerHTML = `<div class="separator"><span>${Number(stageIndex) + 1}</span></div>`;
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

    const colorSelectorWrapper = document.createElement('div');
    colorSelectorWrapper.style.display = enableColorEditToggle.checked ? '' : 'none';
    colorSelectorWrapper.classList.add('color-selector-wrapper');
    toggleDiv.appendChild(colorSelectorWrapper);

    const colorSelector = document.createElement('select');
    colorSelector.id = `color-selector_${stageIndex}`;
    colorSelector.classList.add('color-selector');
    fillColorSelector(colorSelector);
    if (gameInfo.color) {
        colorSelector.dataset.source = 'gameInfo';
        colorSelector.value =  getColorOptionName(gameInfo.color, gameInfo.color.categoryName);
    } else {
        const scoreboardColor = scoreboardData.value.colorInfo;
        colorSelector.dataset.source = 'scoreboard';
        colorSelector.value = getColorOptionName(scoreboardColor, scoreboardColor.categoryName);
    }
    colorSelectorWrapper.appendChild(colorSelector);
    colorSelector.addEventListener('change', event => {
        const target = event.target as HTMLSelectElement;
        const index = parseInt(target.id.split('_')[1], 10);
        target.dataset.source = 'gameInfo-edited';

        const colorSwapToggle = document.getElementById(`color-swap-toggle_${index}`) as HTMLInputElement;
        colorSwapToggle.dataset.source = 'gameInfo-edited';

        const colorOption = target.options[target.selectedIndex] as HTMLOptionElement;
        updateButtonColors(
            index,
            colorSwapToggle.checked ? colorOption.dataset.secondColor : colorOption.dataset.firstColor,
            colorSwapToggle.checked ? colorOption.dataset.firstColor : colorOption.dataset.secondColor);
    });
    reminderCreatingElements.push(colorSelector);

    const colorSwapToggleContainer = document.createElement('div');
    addClasses(
        colorSwapToggleContainer,
        'layout',
        'horizontal',
        'center-horizontal',
        'color-swap-toggle-container');
    colorSelectorWrapper.appendChild(colorSwapToggleContainer);

    const colorSwapToggle = document.createElement('input');
    const colorSwapToggleId = `color-swap-toggle_${stageIndex}`;
    colorSwapToggle.type = 'checkbox';
    colorSwapToggle.id = colorSwapToggleId;
    colorSwapToggle.classList.add('color-swap-toggle');
    if (gameInfo.color) {
        colorSwapToggle.dataset.source = 'gameInfo';
        colorSwapToggle.checked = gameInfo.color.colorsSwapped;
    } else {
        colorSwapToggle.dataset.source = 'scoreboard';
        colorSwapToggle.checked = swapColorsInternally.value;
    }
    colorSwapToggle.addEventListener('change', event => {
        const target = event.target as HTMLInputElement;
        if (target.dataset.source === 'scoreboard') {
            swapColorsInternally.value = target.checked;
        } else if (target.dataset.source === 'gameInfo') {
            const toggleIndex = parseInt(target.id.split('_')[1], 10);
            const existingColor = gameData.value[toggleIndex].color;
            gameData.value[toggleIndex].color = {
                ...existingColor,
                colorsSwapped: !existingColor.colorsSwapped,
                clrA: existingColor.clrB,
                clrB: existingColor.clrA
            };
        } else if (target.dataset.source === 'gameInfo-edited') {
            const toggleIndex = parseInt(target.id.split('_')[1], 10);
            const colorSelector = document.getElementById(`color-selector_${toggleIndex}`) as HTMLSelectElement;
            const colorOption = colorSelector.options[colorSelector.selectedIndex] as HTMLOptionElement;
            updateButtonColors(
                toggleIndex,
                colorSwapToggle.checked ? colorOption.dataset.secondColor : colorOption.dataset.firstColor,
                colorSwapToggle.checked ? colorOption.dataset.firstColor : colorOption.dataset.secondColor);
        }
    });
    colorSwapToggleContainer.appendChild(colorSwapToggle);

    const colorSwapToggleLabel = document.createElement('label');
    colorSwapToggleLabel.htmlFor = colorSwapToggleId;
    colorSwapToggleLabel.innerText = 'Swap colors';
    colorSwapToggleLabel.classList.add('white-label');
    colorSwapToggleContainer.appendChild(colorSwapToggleLabel);

    addChangeReminder(reminderCreatingElements, roundUpdateButton);

    const noWinButton = document.createElement('button');
    noWinButton.classList.add('no-win-toggle');
    noWinButton.classList.add('max-width');
    noWinButton.classList.add('red');
    noWinButton.id = `no-win-toggle_${stageIndex}`;
    noWinButton.innerText = '✖';
    noWinButton.disabled = true;

    const AWinButton = document.createElement('button');
    AWinButton.classList.add('team-a-win-toggle');
    AWinButton.classList.add('max-width');
    AWinButton.id = `team-a-win-toggle_${stageIndex}`;
    AWinButton.innerText = 'A';

    const BWinButton = document.createElement('button');
    BWinButton.classList.add('team-b-win-toggle');
    BWinButton.classList.add('max-width');
    BWinButton.id = `team-b-win-toggle_${stageIndex}`;
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

document.getElementById('btn-reset').onclick = () => {
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
    const games: Game[] = [];

    for (let i = 0; i < numberOfGames; i++) {
        const currentGame: Game = {};

        const stageSelector = document.getElementById(`stage-selector_${i}`) as HTMLSelectElement;
        currentGame.stage = stageSelector.value;

        const modeSelector = document.getElementById(`mode-selector_${i}`) as HTMLSelectElement;
        currentGame.mode = modeSelector.value;
        games.push(currentGame);

        const colorSelector = document.getElementById(`color-selector_${i}`) as HTMLSelectElement;

        if (colorSelector.dataset.source === 'gameInfo-edited') {
            const colorSwapToggle = document.getElementById(`color-swap-toggle_${i}`) as HTMLInputElement;
            const colorOption = colorSelector.options[colorSelector.selectedIndex] as HTMLOptionElement;

            colorSelector.dataset.source = 'gameInfo';
            colorSwapToggle.dataset.source = 'gameInfo';

            gameData.value[i].color = {
                index: Number(colorOption.dataset.index),
                title: colorOption.text,
                clrA: colorSwapToggle.checked ? colorOption.dataset.secondColor : colorOption.dataset.firstColor,
                clrB: colorSwapToggle.checked ? colorOption.dataset.firstColor : colorOption.dataset.secondColor,
                categoryName: colorOption.dataset.categoryName,
                colorsSwapped: colorSwapToggle.checked
            };
        }
    }

    rounds.value[activeRoundId.value].games = games;
});
