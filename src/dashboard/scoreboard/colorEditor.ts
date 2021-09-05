import { activeRound, swapColorsInternally } from './replicants';
import { ColorInfo } from 'types/colors';
import { fillColorSelector } from '../helpers/colorHelper';
import { getColorOptionName } from '../../helpers/splatoonData';
import { SetActiveColorRequest } from 'types/messages/activeRound';

const customColorToggle = <HTMLInputElement> document.getElementById('custom-color-toggle');
const colorSelector = <HTMLSelectElement> document.getElementById('color-selector');

fillColorSelector(colorSelector);

activeRound.on('change', newValue => {
    colorSelector.value = getColorOptionName(newValue.activeColor.index, newValue.activeColor.categoryName);

    document.getElementById('team-a-color-display').style.backgroundColor = newValue.teamA.color;
    document.getElementById('team-b-color-display').style.backgroundColor = newValue.teamB.color;
    (document.getElementById('team-a-custom-color') as HTMLInputElement).value = newValue.teamA.color;
    (document.getElementById('team-b-custom-color') as HTMLInputElement).value = newValue.teamB.color;

    const customColorEnabled = newValue.activeColor.isCustom;
    customColorToggle.checked = customColorEnabled;
    updateCustomColorToggle(customColorEnabled);
});

customColorToggle.addEventListener('change', e => {
    updateCustomColorToggle((e.target as HTMLInputElement).checked);
});

function updateCustomColorToggle(checked: boolean) {
    const colorSelectContainer = document.getElementById('color-select-container');
    const customColorContainer = document.getElementById('custom-color-select-container');

    if (checked) {
        colorSelectContainer.style.display = 'none';
        customColorContainer.style.display = 'flex';
    } else {
        colorSelectContainer.style.display = 'unset';
        customColorContainer.style.display = 'none';
    }
}

document.getElementById('swap-color-order-btn').addEventListener('click', () => {
    swapColorsInternally.value = !swapColorsInternally.value;
});

document.getElementById('update-scoreboard-btn').addEventListener('click', () => {
    const colorOption = <HTMLOptionElement> colorSelector.options[colorSelector.selectedIndex];

    let clrInfo: ColorInfo;
    const isCustomColor = customColorToggle.checked;

    if (isCustomColor) {
        clrInfo = {
            index: 0,
            title: 'Custom Color',
            clrA: (document.getElementById('team-a-custom-color') as HTMLInputElement).value,
            clrB: (document.getElementById('team-b-custom-color') as HTMLInputElement).value,
            isCustom: true
        };
    } else {
        clrInfo = {
            index: Number(colorOption.dataset.index),
            title: colorOption.text,
            clrA: swapColorsInternally.value ? colorOption.dataset.secondColor : colorOption.dataset.firstColor,
            clrB: swapColorsInternally.value ? colorOption.dataset.firstColor : colorOption.dataset.secondColor,
            isCustom: false
        };
    }

    nodecg.sendMessage('setActiveColor', {
        color: clrInfo,
        categoryName: isCustomColor ? 'Custom Color' : colorOption.dataset.categoryName
    } as SetActiveColorRequest);
});
