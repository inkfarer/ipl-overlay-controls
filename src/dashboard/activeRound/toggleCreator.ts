import { ActiveRoundGame } from 'types/activeRoundGame';
import { addChangeReminder } from '../helpers/buttonHelper';
import { fillList } from '../helpers/selectHelper';
import { getColorOptionName, splatModes, splatStages } from '../../helpers/splatoonData';
import { fillColorSelector } from '../helpers/colorHelper';
import {
    getActiveRoundColors,
    handleColorSelectorChange,
    handleColorSwapToggleChange,
    handleCustomColorListenerChange,
    toggleCustomColorSelectorVisibility
} from './toggleHelper';
import { swapColorsInternally } from './replicants';
import { appendChildren } from '../helpers/elemHelper';
import { GameWinner } from 'types/enums/gameWinner';
import { enableColorEditToggle } from './main';
import { SetWinnerRequest } from 'types/messages/activeRound';
import { setWinToggleColor } from './winToggleColorHelper';

const roundUpdateButton = document.getElementById('update-round') as HTMLButtonElement;

export function addToggle(roundElement: ActiveRoundGame, stageIndex: number): void {
    const colorData = roundElement.color !== undefined ? roundElement.color : getActiveRoundColors();
    const colorSource = roundElement.color !== undefined ? 'gameInfo' : 'scoreboard';

    const numberDisplay = document.createElement('div');
    numberDisplay.classList.add('round-number-display');
    numberDisplay.innerText = String(stageIndex + 1);

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
    colorSelector.value = getColorOptionName(colorData.index, colorData.categoryName);
    colorSelector.style.display = colorData.isCustom ? 'none' : '';
    colorSelector.addEventListener('change', handleColorSelectorChange);

    const colorSwapToggle = document.createElement('input');
    setToggleElementIdAndClass(colorSwapToggle, 'color-swap-toggle', stageIndex);
    colorSwapToggle.type = 'checkbox';
    colorSwapToggle.dataset.source = colorSource;
    colorSwapToggle.checked = roundElement.color !== undefined
        ? roundElement.color.colorsSwapped : swapColorsInternally.value;
    colorSwapToggle.addEventListener('change', handleColorSwapToggleChange);

    const colorSwapToggleLabel = document.createElement('label');
    colorSwapToggleLabel.htmlFor = `color-swap-toggle_${stageIndex}`;
    colorSwapToggleLabel.innerText = 'Swap colors';
    colorSwapToggleLabel.classList.add('white-label');

    const customColorToggle = document.createElement('input');
    setToggleElementIdAndClass(customColorToggle, 'custom-color-toggle', stageIndex);
    customColorToggle.type = 'checkbox';
    customColorToggle.checked = colorData.isCustom;
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
    customColorSelectorWrapper.classList.add('layout', 'horizontal');
    appendChildren(customColorSelectorWrapper, customColorSelectorA, customColorSelectorB);
    customColorSelectorWrapper.style.display = colorData.isCustom ? '' : 'none';

    const colorDataToggleContainer = document.createElement('div');
    colorDataToggleContainer.classList.add('layout', 'horizontal', 'center-horizontal', 'color-swap-toggle-container');
    appendChildren(colorDataToggleContainer,
        colorSwapToggle, colorSwapToggleLabel, customColorToggle, customColorToggleLabel);

    const winButtonContainer = document.createElement('div');
    winButtonContainer.classList.add('layout', 'horizontal', 'win-button-container');
    appendChildren(winButtonContainer,
        createWinButton(GameWinner.NO_WINNER, stageIndex, roundElement.winner),
        createWinButton(GameWinner.ALPHA, stageIndex, roundElement.winner, colorData.clrA),
        createWinButton(GameWinner.BRAVO, stageIndex, roundElement.winner, colorData.clrB));

    const colorSelectorWrapper = document.createElement('div');
    colorSelectorWrapper.style.display = enableColorEditToggle.checked ? '' : 'none';
    colorSelectorWrapper.classList.add(
        'color-selector-wrapper',
        'layout',
        'horizontal',
        'center-vertical',
        'even-spacing');
    appendChildren(colorSelectorWrapper, colorSelector, customColorSelectorWrapper, colorDataToggleContainer);

    const toggleDiv = document.createElement('div');
    toggleDiv.classList.add('toggles');
    toggleDiv.id = `game-editor_${stageIndex}`;
    appendChildren(toggleDiv, numberDisplay, stageSelector, modeSelector, colorSelectorWrapper, winButtonContainer);
    toggleDiv.classList.add('layout', 'horizontal', 'center-horizontal', 'even-spacing');

    document.getElementById('toggles').appendChild(toggleDiv);
}

function setToggleElementIdAndClass(element: HTMLElement, className: string, index: number) {
    element.classList.add(className);
    element.id = `${className}_${index}`;
}

function createWinButton(toggleType: GameWinner,
    index: number,
    currentWinner: GameWinner,
    color?: string): HTMLButtonElement {

    const button = document.createElement('button');

    const buttonClass = {
        [GameWinner.NO_WINNER]: 'no-win-toggle',
        [GameWinner.ALPHA]: 'team-a-win-toggle',
        [GameWinner.BRAVO]: 'team-b-win-toggle'
    }[toggleType];
    button.classList.add(buttonClass, 'max-width');

    if (toggleType === GameWinner.NO_WINNER) {
        button.classList.add('red');
    } else {
        button.classList.add('win-set-toggle');
    }

    button.disabled = toggleType === currentWinner;

    if (color) {
        setWinToggleColor(button, color);
    }

    button.id = `${buttonClass}_${index}`;

    button.innerHTML = {
        [GameWinner.NO_WINNER]: '<i class="fas fa-times"></i>',
        [GameWinner.ALPHA]: 'A',
        [GameWinner.BRAVO]: 'B'
    }[toggleType];

    button.addEventListener('click', event => {
        const stageIndex = parseInt((event.target as HTMLButtonElement).id.split('_')[1], 10);
        nodecg.sendMessage('setWinner', { winner: toggleType, roundIndex: stageIndex } as SetWinnerRequest);
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
