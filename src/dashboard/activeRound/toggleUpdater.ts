import { GameColor } from 'types/colors';
import { swapColorsInternally } from './replicants';
import { getColorOptionName } from '../../helpers/splatoonData';
import {
    getActiveRoundColors,
    getWinToggles,
    toggleCustomColorSelectorVisibility
} from './toggleHelper';
import { roundNameElem } from './main';
import { ActiveRoundGame } from 'types/activeRoundGame';
import { GameWinner } from 'types/enums/gameWinner';
import { setValueIfNotEdited } from '../helpers/inputHelper';
import { updateWinToggleColors } from './winToggleColorHelper';

export function updateToggles(games: ActiveRoundGame[], roundName: string): void {
    roundNameElem.innerText = roundName;

    games.forEach((game, index) => {
        updateStagesAndModes(index, game);
        setGameWinner(index, game.winner);
        updateColor(index, game.color);
    });
}

function setGameWinner(index: number, winner: GameWinner) {
    const buttons = getWinToggles(index);
    Object.values(buttons).forEach(button => {
        button.disabled = false;
    });

    buttons[winner].disabled = true;
}

function updateStagesAndModes(index: number, game: ActiveRoundGame) {
    const stageSelector = document.getElementById(`stage-selector_${index}`) as HTMLSelectElement;
    const modeSelector = document.getElementById(`mode-selector_${index}`) as HTMLSelectElement;
    setValueIfNotEdited(stageSelector, game.stage);
    setValueIfNotEdited(modeSelector, game.mode);
}

function updateColor(index: number, color?: GameColor): void {
    const gameEditor = document.getElementById(`game-editor_${index}`);
    const colorSelect = gameEditor.querySelector('.color-selector') as HTMLSelectElement;

    if (colorSelect.dataset.source !== 'gameInfo-edited') {
        const colorSwapToggle = gameEditor.querySelector('.color-swap-toggle') as HTMLInputElement;
        const customColorToggle = gameEditor.querySelector('.custom-color-toggle') as HTMLInputElement;
        const teamAColorInput = document.getElementById(`custom-color-selector_a_${index}`) as HTMLInputElement;
        const teamBColorInput = document.getElementById(`custom-color-selector_b_${index}`) as HTMLInputElement;

        const colorData = color ? color : getActiveRoundColors();
        const colorSource = color ? 'gameInfo' : 'scoreboard';

        colorSelect.value = getColorOptionName(colorData.index, colorData.categoryName);
        colorSelect.dataset.source = colorSource;
        colorSwapToggle.dataset.source = colorSource;
        colorSwapToggle.checked = color ? color.colorsSwapped : swapColorsInternally.value;
        teamAColorInput.value = colorData.clrA;
        teamBColorInput.value = colorData.clrB;
        customColorToggle.checked = colorData.isCustom;

        toggleCustomColorSelectorVisibility(index, colorData.isCustom);
        updateWinToggleColors(index, colorData.clrA, colorData.clrB);
    }
}
