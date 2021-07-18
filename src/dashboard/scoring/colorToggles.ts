import { activeRound, swapColorsInternally } from './replicants';
import { ColorGroup } from 'types/colorGroup';
import { ColorInfo } from 'types/colorInfo';
import { colors } from '../../helpers/splatoonData';

const colorToggleNext = document.getElementById('color-toggle-next');
const colorTogglePrevious = document.getElementById('color-toggle-prev');

activeRound.on('change', newValue => {
    if (newValue.activeColor.categoryName === 'Custom Color') {
        return disableToggles();
    } else {
        enableToggles();
    }

    const selectedGroup: ColorGroup = colors.filter(group => {
        return group.meta.name === newValue.activeColor.categoryName;
    })[0];

    const selectedIndex = newValue.activeColor.index;
    const length = selectedGroup.colors.length;

    let nextColor = selectedGroup.colors.filter(color => {
        return color.index === (selectedIndex + 1 === length ? 0 : selectedIndex + 1);
    })[0];
    let previousColor = selectedGroup.colors.filter(color => {
        return color.index === (selectedIndex === 0 ? length - 1 : selectedIndex - 1);
    })[0];

    if (swapColorsInternally.value === true) {
        nextColor = swapColors(nextColor);
        previousColor = swapColors(previousColor);
    }

    updateColorToggle(colorToggleNext, nextColor, selectedGroup.meta.name);
    updateColorToggle(colorTogglePrevious, previousColor, selectedGroup.meta.name);
});

function swapColors(data: ColorInfo): ColorInfo {
    return {
        ...data,
        clrA: data.clrB,
        clrB: data.clrA
    };
}

function updateColorToggle(toggle: HTMLElement, data: ColorInfo, categoryName: string): void {
    // Update colors
    (toggle.querySelector('.color-toggle-display.a') as HTMLElement).style.backgroundColor = data.clrA;
    (toggle.querySelector('.color-toggle-display.b') as HTMLElement).style.backgroundColor = data.clrB;

    toggle.dataset.colorInfo = JSON.stringify(data);
    toggle.dataset.categoryName = categoryName;
}

colorTogglePrevious.addEventListener('click', handleColorToggleClick);
colorToggleNext.addEventListener('click', handleColorToggleClick);

function handleColorToggleClick(e: MouseEvent): void {
    const color: ColorInfo = JSON.parse((e.target as HTMLElement).dataset.colorInfo);
    if (activeRound.value.activeColor.index === color.index) return;

    const newValue = activeRound.value;

    newValue.teamA.color = color.clrA;
    newValue.teamB.color = color.clrB;
    newValue.activeColor = {
        ...activeRound.value.activeColor,
        index: color.index,
        title: color.title
    };

    activeRound.value = newValue;
}

function disableToggles(): void {
    colorTogglePrevious.dataset.disabled = '';
    colorToggleNext.dataset.disabled = '';
}

function enableToggles(): void {
    colorTogglePrevious.removeAttribute('data-disabled');
    colorToggleNext.removeAttribute('data-disabled');
}
