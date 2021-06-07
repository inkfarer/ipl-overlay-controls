import { colors } from 'bundle/scoring/colors';
import { scoreboardData } from 'bundle/scoring/replicants';
import { ColorInfo } from 'bundle/types/colorInfo';

const customColorToggle = <HTMLInputElement> document.getElementById('custom-color-toggle');
const colorSelector = <HTMLSelectElement> document.getElementById('color-selector');

for (let i = 0; i < colors.length; i++) {
    const element = colors[i];

    const optGroup = document.createElement('optgroup');
    optGroup.label = element.meta.name;

    for (let j = 0; j < element.colors.length; j++) {
        const color = element.colors[j];

        const option = document.createElement('option');
        option.value = color.index.toString();
        option.text = color.title;
        option.dataset.firstColor = color.clrA;
        option.dataset.secondColor = color.clrB;
        // Make custom color unselectable by user
        option.disabled = color.index === 999;

        optGroup.appendChild(option);
    }

    colorSelector.appendChild(optGroup);
}

scoreboardData.on('change', newValue => {
    colorSelector.value = newValue.colorInfo.index.toString();

    updateColorDisplay(
        (newValue.colorInfo as ColorInfo),
        document.getElementById('team-a-color-display'),
        'a',
        newValue.swapColorOrder
    );
    updateColorDisplay(
        (newValue.colorInfo as ColorInfo),
        document.getElementById('team-b-color-display'),
        'b',
        newValue.swapColorOrder
    );
    updateColorDisplay(
        (newValue.colorInfo as ColorInfo),
        document.getElementById('team-a-custom-color'),
        'a',
        newValue.swapColorOrder
    );
    updateColorDisplay(
        (newValue.colorInfo as ColorInfo),
        document.getElementById('team-b-custom-color'),
        'b',
        newValue.swapColorOrder
    );

    const customColorEnabled = newValue.colorInfo.index === 999;
    customColorToggle.checked = customColorEnabled;
    updateCustomColorToggle(customColorEnabled);
});

function updateColorDisplay(colorInfo: ColorInfo, elem: HTMLElement, team: 'a' | 'b', swapColors: boolean) {
    let color;

    if (team === 'a' && !swapColors) color = colorInfo.clrA;
    else if (team === 'a' && swapColors) color = colorInfo.clrB;
    else if (team === 'b' && !swapColors) color = colorInfo.clrB;
    else if (team === 'b' && swapColors) color = colorInfo.clrA;
    else color = '#000000';

    switch (elem.tagName.toLowerCase()) {
        case 'input':
            (elem as HTMLInputElement).value = color;
            break;
        default:
            elem.style.backgroundColor = color;
    }
}

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

document.getElementById('swap-color-order-btn').onclick = () => {
    scoreboardData.value.swapColorOrder = !scoreboardData.value.swapColorOrder;
};

document.getElementById('update-scoreboard-btn').addEventListener('click', () => {
    const colorOption = <HTMLOptionElement> colorSelector.options[colorSelector.selectedIndex];

    let clrInfo: ColorInfo;
    let { swapColorOrder } = scoreboardData.value;

    if (customColorToggle.checked) {
        clrInfo = {
            index: 999,
            title: 'Custom Color',
            clrA: (document.getElementById('team-a-custom-color') as HTMLInputElement).value,
            clrB: (document.getElementById('team-b-custom-color') as HTMLInputElement).value
        };
        swapColorOrder = false;
    } else {
        clrInfo = {
            index: Number(colorOption.value),
            title: colorOption.text,
            clrA: colorOption.dataset.firstColor,
            clrB: colorOption.dataset.secondColor
        };
    }

    scoreboardData.value.colorInfo = clrInfo;
    scoreboardData.value.swapColorOrder = swapColorOrder;
});
