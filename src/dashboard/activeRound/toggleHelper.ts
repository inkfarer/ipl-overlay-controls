import { activeRound, swapColorsInternally } from './replicants';
import { GameWinner } from 'types/enums/gameWinner';
import { ColorInfo } from 'types/colors';
import { updateWinToggleColors } from './winToggleColorHelper';

export function handleCustomColorListenerChange(event: Event): void {
    const index = parseInt((event.target as HTMLInputElement).id.split('_')[2], 10);

    const teamColorSelector = document.getElementById(`color-selector_${index}`);
    teamColorSelector.dataset.source = 'gameInfo-edited';
    const colorSwapToggle = document.getElementById(`color-swap-toggle_${index}`) as HTMLInputElement;
    colorSwapToggle.dataset.source = 'gameInfo-edited';

    const customColorsWrapper = document.getElementById(`custom-color-select-wrapper_${index}`);
    const teamASelector = customColorsWrapper.querySelector('.team-a') as HTMLInputElement;
    const teamBSelector = customColorsWrapper.querySelector('.team-b') as HTMLInputElement;

    updateWinToggleColors(index, teamASelector.value, teamBSelector.value);
}

export function handleColorSelectorChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const index = parseInt(target.id.split('_')[1], 10);
    target.dataset.source = 'gameInfo-edited';

    const colorSwapToggle = document.getElementById(`color-swap-toggle_${index}`) as HTMLInputElement;
    colorSwapToggle.dataset.source = 'gameInfo-edited';

    const colorOption = target.options[target.selectedIndex] as HTMLOptionElement;
    updateWinToggleColors(
        index,
        colorSwapToggle.checked ? colorOption.dataset.secondColor : colorOption.dataset.firstColor,
        colorSwapToggle.checked ? colorOption.dataset.firstColor : colorOption.dataset.secondColor);
}

export function handleColorSwapToggleChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.dataset.source === 'scoreboard') {
        swapColorsInternally.value = target.checked;
    } else if (target.dataset.source === 'gameInfo') {
        const toggleIndex = parseInt(target.id.split('_')[1], 10);
        const existingColor = activeRound.value.games[toggleIndex].color;
        activeRound.value.games[toggleIndex].color = {
            ...existingColor,
            colorsSwapped: !existingColor.colorsSwapped,
            clrA: existingColor.clrB,
            clrB: existingColor.clrA
        };
    } else if (target.dataset.source === 'gameInfo-edited') {
        const toggleIndex = parseInt(target.id.split('_')[1], 10);
        const customColorToggle
            = document.getElementById(`custom-color-toggle_${toggleIndex}`) as HTMLInputElement;

        if (customColorToggle.checked) {
            const teamAColorInput
                = document.getElementById(`custom-color-selector_a_${toggleIndex}`) as HTMLInputElement;
            const teamBColorInput
                = document.getElementById(`custom-color-selector_b_${toggleIndex}`) as HTMLInputElement;

            const teamAColor = teamAColorInput.value;
            teamAColorInput.value = teamBColorInput.value;
            teamBColorInput.value = teamAColor;
            updateWinToggleColors(toggleIndex, teamAColorInput.value, teamBColorInput.value);
        } else {
            const colorSelector = document.getElementById(`color-selector_${toggleIndex}`) as HTMLSelectElement;
            const colorOption = colorSelector.options[colorSelector.selectedIndex] as HTMLOptionElement;
            updateWinToggleColors(
                toggleIndex,
                target.checked ? colorOption.dataset.secondColor : colorOption.dataset.firstColor,
                target.checked ? colorOption.dataset.firstColor : colorOption.dataset.secondColor);
        }
    }
}

export function toggleCustomColorSelectorVisibility(index: number, isCustomColor: boolean): void {
    const customColorSelectWrapper = document.getElementById(`custom-color-select-wrapper_${index}`);
    const colorSelect = document.getElementById(`color-selector_${index}`);
    const toggle = document.getElementById(`custom-color-toggle_${index}`) as HTMLInputElement;

    toggle.checked = isCustomColor;
    customColorSelectWrapper.style.display = isCustomColor ? '' : 'none';
    colorSelect.style.display = isCustomColor ? 'none' : '';
}

export function getWinToggles(id: number): { [key in GameWinner]: HTMLButtonElement } {
    return {
        [GameWinner.NO_WINNER]: document.getElementById(`no-win-toggle_${id}`) as HTMLButtonElement,
        [GameWinner.ALPHA]: document.getElementById(`team-a-win-toggle_${id}`) as HTMLButtonElement,
        [GameWinner.BRAVO]: document.getElementById(`team-b-win-toggle_${id}`) as HTMLButtonElement
    };
}

export function getActiveRoundColors(): ColorInfo & { categoryName: string } {
    return {
        ...activeRound.value.activeColor,
        clrA: activeRound.value.teamA.color,
        clrB: activeRound.value.teamB.color
    };
}
