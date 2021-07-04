import { colors } from './colors';
import { scoreboardData, swapColorsInternally } from './replicants';
import { ColorInfo } from 'types/colorInfo';

const customColorToggle = <HTMLInputElement> document.getElementById('custom-color-toggle');
const colorSelector = <HTMLSelectElement> document.getElementById('color-selector');

for (let i = 0; i < colors.length; i++) {
    const element = colors[i];

    const optGroup = document.createElement('optgroup');
    optGroup.label = element.meta.name;

    for (let j = 0; j < element.colors.length; j++) {
        const color = element.colors[j];

        const option = document.createElement('option');
        option.value = `${formatCategoryName(element.meta.name)}_${color.index}`;
        option.text = color.title;
        option.dataset.index = String(color.index);
        option.dataset.firstColor = color.clrA;
        option.dataset.secondColor = color.clrB;
        option.dataset.categoryName = element.meta.name;
        // Make custom color unselectable by user
        option.disabled = color.index === 999;

        optGroup.appendChild(option);
    }

    colorSelector.appendChild(optGroup);
}

scoreboardData.on('change', newValue => {
    colorSelector.value = `${formatCategoryName(newValue.colorInfo.categoryName)}_${newValue.colorInfo.index}`;

    document.getElementById('team-a-color-display').style.backgroundColor = newValue.colorInfo.clrA;
    document.getElementById('team-b-color-display').style.backgroundColor = newValue.colorInfo.clrB;
    (document.getElementById('team-a-custom-color') as HTMLInputElement).value = newValue.colorInfo.clrA;
    (document.getElementById('team-b-custom-color') as HTMLInputElement).value = newValue.colorInfo.clrB;

    const customColorEnabled = newValue.colorInfo.index === 999;
    customColorToggle.checked = customColorEnabled;
    updateCustomColorToggle(customColorEnabled);
});

customColorToggle.onchange = e => {
    updateCustomColorToggle((e.target as HTMLInputElement).checked);
};

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
    console.log(swapColorsInternally.value);
    swapColorsInternally.value = !swapColorsInternally.value;
    const { colorInfo } = scoreboardData.value;
    const teamAColor = colorInfo.clrA;
    colorInfo.clrA = colorInfo.clrB;
    colorInfo.clrB = teamAColor;
});

document.getElementById('update-scoreboard-btn').addEventListener('click', () => {
    console.log(swapColorsInternally.value);
    const colorOption = <HTMLOptionElement> colorSelector.options[colorSelector.selectedIndex];

    let clrInfo: ColorInfo;
    const isCustomColor = customColorToggle.checked;

    if (isCustomColor) {
        clrInfo = {
            index: 999,
            title: 'Custom Color',
            clrA: (document.getElementById('team-a-custom-color') as HTMLInputElement).value,
            clrB: (document.getElementById('team-b-custom-color') as HTMLInputElement).value,
        };
    } else {
        clrInfo = {
            index: Number(colorOption.dataset.index),
            title: colorOption.text,
            clrA: swapColorsInternally.value ? colorOption.dataset.secondColor : colorOption.dataset.firstColor,
            clrB: swapColorsInternally.value ? colorOption.dataset.firstColor : colorOption.dataset.secondColor,
        };
    }

    scoreboardData.value.colorInfo = {
        ...clrInfo,
        categoryName: isCustomColor ? 'Custom Color' : colorOption.dataset.categoryName
    };
});

function formatCategoryName(name: string): string {
    return name.replace(' ', '-').toLowerCase();
}
