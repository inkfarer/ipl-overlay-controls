import { addChangeReminder, fillList } from '../globalScripts';
import { Game, GameData } from 'schemas';

import './setWinnersAutomatically';
import './buttonColors';

import '../styles/globalStyles.css';
import './currentRound.css';
import { splatModes, splatStages } from '../../helpers/splatoonData';
import { GameWinner } from 'types/gameWinner';
import { fillColorSelector, getColorOptionName, getContrastingTextColor } from '../helpers/colorHelper';
import { addClasses, appendChildren } from '../helpers/elemHelper';
import { createEmptyGameData } from '../../helpers/gameDataHelper';
import {
    handleColorSelectorChange,
    handleColorSwapToggleChange,
    handleCustomColorListenerChange
} from './toggleEvents';
import { activeRoundId, gameData, rounds, scoreboardData, swapColorsInternally } from './replicants';

const roundNameElem = document.getElementById('round-name');
const roundUpdateButton = document.getElementById('update-round') as HTMLButtonElement;
const enableColorEditToggle = document.getElementById('enable-color-edit-toggle') as HTMLInputElement;

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

export function updateButtonColors(index: number, clrA: string, clrB: string): void {
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
    const gameInfo = gameData.value[stageIndex];
    const colorData = gameInfo.color ? gameInfo.color : scoreboardData.value.colorInfo;
    const colorSource = gameInfo.color ? 'gameInfo' : 'scoreboard';

    const stageModeDisplay = document.createElement('div');
    stageModeDisplay.innerHTML = `<div class="separator"><span>${Number(stageIndex) + 1}</span></div>`;

    const stageSelector = document.createElement('select');
    setToggleElementIdAndClass(stageSelector, 'stage-selector', stageIndex);
    fillList(stageSelector, splatStages);
    stageSelector.value = roundElement.stage;

    const modeSelector = document.createElement('select');
    setToggleElementIdAndClass(modeSelector, 'mode-selector', stageIndex);
    fillList(modeSelector, splatModes);
    modeSelector.value = roundElement.mode;

    const customColorSelectorA = createCustomColorSelector(stageIndex, 'a', colorData.clrA);
    const customColorSelectorB = createCustomColorSelector(stageIndex, 'b', colorData.clrB);

    const colorSelector = document.createElement('select');
    setToggleElementIdAndClass(colorSelector, 'color-selector', stageIndex);
    fillColorSelector(colorSelector);
    colorSelector.dataset.source = colorSource;
    colorSelector.value = getColorOptionName(colorData, colorData.categoryName);
    colorSelector.style.display = colorData.index === 999 ? 'none' : '';
    colorSelector.addEventListener('change', handleColorSelectorChange);

    const colorSwapToggle = document.createElement('input');
    setToggleElementIdAndClass(colorSwapToggle, 'color-swap-toggle', stageIndex);
    colorSwapToggle.type = 'checkbox';
    colorSwapToggle.dataset.source = colorSource;
    colorSwapToggle.checked = gameInfo.color ? gameInfo.color.colorsSwapped : swapColorsInternally.value;
    colorSwapToggle.addEventListener('change', handleColorSwapToggleChange);

    const colorSwapToggleLabel = document.createElement('label');
    colorSwapToggleLabel.htmlFor = `color-swap-toggle_${stageIndex}`;
    colorSwapToggleLabel.innerText = 'Swap colors';
    colorSwapToggleLabel.classList.add('white-label');

    const customColorToggle = document.createElement('input');
    setToggleElementIdAndClass(customColorToggle, 'custom-color-toggle', stageIndex);
    customColorToggle.type = 'checkbox';
    customColorToggle.checked = colorData.index === 999;
    customColorToggle.addEventListener('change', event => {
        const index = parseInt((event.target as HTMLInputElement).id.split('_')[1], 10);
        toggleCustomColorSelectorVisibility(index, (event.target as HTMLInputElement).checked);
    });

    const customColorToggleLabel = document.createElement('label');
    customColorToggleLabel.classList.add('white-label');
    customColorToggleLabel.innerText = 'Custom';
    customColorToggleLabel.htmlFor = `custom-color-toggle_${stageIndex}`;

    addChangeReminder(
        [stageSelector, modeSelector, customColorSelectorA, customColorSelectorB, colorSelector],
        roundUpdateButton);

    const customColorSelectorWrapper = document.createElement('div');
    setToggleElementIdAndClass(customColorSelectorWrapper, 'custom-color-select-wrapper', stageIndex);
    addClasses(customColorSelectorWrapper, 'layout', 'horizontal');
    appendChildren(customColorSelectorWrapper, customColorSelectorA, customColorSelectorB);
    customColorSelectorWrapper.style.display = colorData.index === 999 ? '' : 'none';

    const colorDataToggleContainer = document.createElement('div');
    addClasses(colorDataToggleContainer,
        'layout', 'horizontal', 'center-horizontal', 'color-swap-toggle-container');
    appendChildren(colorDataToggleContainer,
        colorSwapToggle, colorSwapToggleLabel, customColorToggle, customColorToggleLabel);

    const winButtonContainer = document.createElement('div');
    addClasses(winButtonContainer, 'layout', 'horizontal', 'win-button-container');
    appendChildren(winButtonContainer,
        createWinButton(GameWinner.NO_WINNER, stageIndex),
        createWinButton(GameWinner.ALPHA, stageIndex),
        createWinButton(GameWinner.BRAVO, stageIndex));

    const colorSelectorWrapper = document.createElement('div');
    colorSelectorWrapper.style.display = enableColorEditToggle.checked ? '' : 'none';
    colorSelectorWrapper.classList.add('color-selector-wrapper');
    appendChildren(colorSelectorWrapper, colorSelector, customColorSelectorWrapper, colorDataToggleContainer);

    const toggleDiv = document.createElement('div');
    toggleDiv.classList.add('toggles');
    toggleDiv.id = `game-editor_${stageIndex}`;
    appendChildren(toggleDiv, stageModeDisplay, stageSelector, modeSelector, colorSelectorWrapper, winButtonContainer);

    document.getElementById('toggles').appendChild(toggleDiv);
}

function setToggleElementIdAndClass(element: HTMLElement, className: string, index: number) {
    element.classList.add(className);
    element.id = `${className}_${index}`;
}

function toggleCustomColorSelectorVisibility(index: number, isCustomColor: boolean): void {
    const customColorSelectWrapper = document.getElementById(`custom-color-select-wrapper_${index}`);
    const colorSelect = document.getElementById(`color-selector_${index}`);
    const toggle = document.getElementById(`custom-color-toggle_${index}`) as HTMLInputElement;

    toggle.checked = isCustomColor;
    customColorSelectWrapper.style.display = isCustomColor ? '' : 'none';
    colorSelect.style.display = isCustomColor ? 'none' : '';
}

function createWinButton(toggleType: GameWinner, index: number): HTMLButtonElement {
    const button = document.createElement('button');

    const buttonClass = {
        [GameWinner.NO_WINNER]: 'no-win-toggle',
        [GameWinner.ALPHA]: 'team-a-win-toggle',
        [GameWinner.BRAVO]: 'team-b-win-toggle'
    }[toggleType];
    addClasses(button, buttonClass, 'max-width');
    if (toggleType === GameWinner.NO_WINNER) {
        button.classList.add('red');
        button.disabled = true;
    }
    button.id = `${buttonClass}_${index}`;

    button.innerText = {
        [GameWinner.NO_WINNER]: '✖',
        [GameWinner.ALPHA]: 'A',
        [GameWinner.BRAVO]: 'B'
    }[toggleType];

    button.addEventListener('click', event => {
        const stageIndex = parseInt((event.target as HTMLButtonElement).id.split('_')[1], 10);
        gameData.value[stageIndex].winner = toggleType;
    });

    return button;
}

function createCustomColorSelector(index: number, team: 'a' | 'b', value: string): HTMLInputElement {
    const selector = document.createElement('input');
    selector.type = 'color';
    selector.id = `custom-color-selector_${team}_${index}`;
    selector.classList.add(`team-${team}`);
    selector.value = value;
    selector.addEventListener('change', handleCustomColorListenerChange);
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
