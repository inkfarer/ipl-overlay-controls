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

        if (colorSelect.dataset.source !== 'gameInfo-edited') {
            const colorSwapToggle = gameEditor.querySelector('.color-swap-toggle') as HTMLInputElement;
            const customColorToggle = gameEditor.querySelector('.custom-color-toggle') as HTMLInputElement;
            const teamAColorInput = document.getElementById(`custom-color-selector_a_${i}`) as HTMLInputElement;
            const teamBColorInput = document.getElementById(`custom-color-selector_b_${i}`) as HTMLInputElement;

            const colorData = dataElem.color ? dataElem.color : scoreboardData.value.colorInfo;
            const colorSource = dataElem.color ? 'gameInfo' : 'scoreboard';

            colorSelect.value = getColorOptionName(colorData, colorData.categoryName);
            colorSelect.dataset.source = colorSource;
            colorSwapToggle.dataset.source = colorSource;
            colorSwapToggle.checked = dataElem.color ? dataElem.color.colorsSwapped : swapColorsInternally.value;
            teamAColorInput.value = colorData.clrA;
            teamBColorInput.value = colorData.clrB;
            const isCustomColor = colorData.index === 999;
            customColorToggle.checked = isCustomColor;
            toggleCustomColorSelectorVisibility(i, isCustomColor);

            if (dataElem.color) {
                updateButtonColors(i, dataElem.color.clrA, dataElem.color.clrB);
            } else {
                removeCustomButtonColors(i);
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
    const colorData = gameInfo.color ? gameInfo.color : scoreboardData.value.colorInfo;
    const colorSource = gameInfo.color ? 'gameInfo' : 'scoreboard';

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

    const customColorSelectorWrapper = document.createElement('div');
    customColorSelectorWrapper.id = `custom-color-select-wrapper_${stageIndex}`;
    addClasses(customColorSelectorWrapper, 'layout', 'horizontal');
    customColorSelectorWrapper.style.display = colorData.index === 999 ? '' : 'none';
    colorSelectorWrapper.appendChild(customColorSelectorWrapper);

    const customColorSelectorA = createCustomColorSelector(stageIndex, 'a', colorData.clrA);
    customColorSelectorWrapper.appendChild(customColorSelectorA);
    reminderCreatingElements.push(customColorSelectorA);
    const customColorSelectorB = createCustomColorSelector(stageIndex, 'b', colorData.clrB);
    customColorSelectorWrapper.appendChild(customColorSelectorB);
    reminderCreatingElements.push(customColorSelectorB);

    const colorSelector = document.createElement('select');
    colorSelector.id = `color-selector_${stageIndex}`;
    colorSelector.classList.add('color-selector');
    fillColorSelector(colorSelector);
    colorSelector.dataset.source = colorSource;
    colorSelector.value =  getColorOptionName(colorData, colorData.categoryName);
    colorSelector.style.display = colorData.index === 999 ? 'none' : '';
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

    const colorDataToggleContainer = document.createElement('div');
    addClasses(
        colorDataToggleContainer,
        'layout',
        'horizontal',
        'center-horizontal',
        'color-swap-toggle-container');
    colorSelectorWrapper.appendChild(colorDataToggleContainer);

    const colorSwapToggle = document.createElement('input');
    const colorSwapToggleId = `color-swap-toggle_${stageIndex}`;
    colorSwapToggle.type = 'checkbox';
    colorSwapToggle.id = colorSwapToggleId;
    colorSwapToggle.classList.add('color-swap-toggle');
    colorSwapToggle.dataset.source = colorSource;
    colorSwapToggle.checked = gameInfo.color ? gameInfo.color.colorsSwapped : swapColorsInternally.value;
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
            const customColorToggle =
                document.getElementById(`custom-color-toggle_${toggleIndex}`) as HTMLInputElement ;

            if (customColorToggle.checked) {
                const teamAColorInput =
                    document.getElementById(`custom-color-selector_a_${toggleIndex}`) as HTMLInputElement;
                const teamBColorInput =
                    document.getElementById(`custom-color-selector_b_${toggleIndex}`) as HTMLInputElement;

                const teamAColor = teamAColorInput.value;
                teamAColorInput.value = teamBColorInput.value;
                teamBColorInput.value = teamAColor;
                updateButtonColors(toggleIndex, teamAColorInput.value, teamBColorInput.value);
            } else {
                const colorSelector = document.getElementById(`color-selector_${toggleIndex}`) as HTMLSelectElement;
                const colorOption = colorSelector.options[colorSelector.selectedIndex] as HTMLOptionElement;
                updateButtonColors(
                    toggleIndex,
                    colorSwapToggle.checked ? colorOption.dataset.secondColor : colorOption.dataset.firstColor,
                    colorSwapToggle.checked ? colorOption.dataset.firstColor : colorOption.dataset.secondColor);
            }
        }
    });
    colorDataToggleContainer.appendChild(colorSwapToggle);

    const colorSwapToggleLabel = document.createElement('label');
    colorSwapToggleLabel.htmlFor = colorSwapToggleId;
    colorSwapToggleLabel.innerText = 'Swap colors';
    colorSwapToggleLabel.classList.add('white-label');
    colorDataToggleContainer.appendChild(colorSwapToggleLabel);

    const customColorToggle = document.createElement('input');
    const customColorToggleId = `custom-color-toggle_${stageIndex}`;
    customColorToggle.id = customColorToggleId;
    customColorToggle.type = 'checkbox';
    customColorToggle.classList.add('custom-color-toggle');
    customColorToggle.checked = colorData.index === 999;
    customColorToggle.addEventListener('change', event => {
        const target = event.target as HTMLInputElement;
        const index = parseInt(target.id.split('_')[1], 10);

        toggleCustomColorSelectorVisibility(index, target.checked);
    });
    colorDataToggleContainer.appendChild(customColorToggle);

    const customColorToggleLabel = document.createElement('label');
    customColorToggleLabel.classList.add('white-label');
    customColorToggleLabel.innerText = 'Custom';
    customColorToggleLabel.htmlFor = customColorToggleId;
    colorDataToggleContainer.appendChild(customColorToggleLabel);

    addChangeReminder(reminderCreatingElements, roundUpdateButton);

    const noWinButton = document.createElement('button');
    addClasses(noWinButton, 'no-win-toggle', 'max-width', 'red');
    noWinButton.id = `no-win-toggle_${stageIndex}`;
    noWinButton.innerText = '✖';
    noWinButton.disabled = true;

    const AWinButton = document.createElement('button');
    addClasses(AWinButton, 'team-a-win-toggle', 'max-width');
    AWinButton.id = `team-a-win-toggle_${stageIndex}`;
    AWinButton.innerText = 'A';

    const BWinButton = document.createElement('button');
    addClasses(BWinButton, 'team-b-win-toggle', 'max-width');
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
    addClasses(winButtonContainer, 'layout', 'horizontal', 'win-button-container');
    winButtonContainer.appendChild(noWinButton);
    winButtonContainer.appendChild(AWinButton);
    winButtonContainer.appendChild(BWinButton);
    toggleDiv.appendChild(winButtonContainer);

    document.getElementById('toggles')
        .appendChild(toggleDiv);
}

function toggleCustomColorSelectorVisibility(index: number, isCustomColor: boolean): void {
    const customColorSelectWrapper = document.getElementById(`custom-color-select-wrapper_${index}`);
    const colorSelect = document.getElementById(`color-selector_${index}`);

    customColorSelectWrapper.style.display = isCustomColor ? '' : 'none';
    colorSelect.style.display = isCustomColor ? 'none' : '';
}

function createCustomColorSelector(index: number, team: 'a' | 'b', value: string): HTMLInputElement {
    const selector = document.createElement('input');
    selector.type = 'color';
    selector.id = `custom-color-selector_${team}_${index}`;
    selector.classList.add(`team-${team}`);
    selector.value = value;
    selector.addEventListener('change', event => {
        const index = parseInt((event.target as HTMLInputElement).id.split('_')[2], 10);

        const teamColorSelector = document.getElementById(`color-selector_${index}`);
        teamColorSelector.dataset.source = 'gameInfo-edited';
        const colorSwapToggle = document.getElementById(`color-swap-toggle_${index}`) as HTMLInputElement;
        colorSwapToggle.dataset.source = 'gameInfo-edited';

        const customColorsWrapper = document.getElementById(`custom-color-select-wrapper_${index}`);
        const teamASelector = customColorsWrapper.querySelector('.team-a') as HTMLInputElement;
        const teamBSelector = customColorsWrapper.querySelector('.team-b') as HTMLInputElement;

        updateButtonColors(index, teamASelector.value, teamBSelector.value);
    });
    return selector;
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
            const customColorToggle = document.getElementById(`custom-color-toggle_${i}`) as HTMLInputElement;

            colorSelector.dataset.source = 'gameInfo';
            colorSwapToggle.dataset.source = 'gameInfo';

            if (customColorToggle.checked) {
                const teamAColorInput = document.getElementById(`custom-color-selector_a_${i}`) as HTMLInputElement;
                const teamBColorInput = document.getElementById(`custom-color-selector_b_${i}`) as HTMLInputElement;

                gameData.value[i].color = {
                    index: 999,
                    title: 'Custom Color',
                    clrA: teamAColorInput.value,
                    clrB: teamBColorInput.value,
                    categoryName: 'Custom Color',
                    colorsSwapped: colorSwapToggle.checked
                };
            } else {
                const colorOption = colorSelector.options[colorSelector.selectedIndex] as HTMLOptionElement;

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
    }

    rounds.value[activeRoundId.value].games = games;
});
