import { scoreboardData } from './replicants';
import { colors } from './colors';
import { ColorGroup } from 'types/colorGroup';
import { ColorInfo } from 'types/colorInfo';

const colorToggleNext = document.getElementById('color-toggle-next');
const colorTogglePrevious = document.getElementById('color-toggle-prev');

scoreboardData.on('change', newValue => {
    const selectedGroup: ColorGroup = colors.filter(group => {
        return group.meta.name === newValue.colorInfo.categoryName;
    })[0];

    const selectedIndex = newValue.colorInfo.index;
    const length = selectedGroup.colors.length;

    const nextColor = selectedGroup.colors.filter(color => {
        return color.index === (selectedIndex + 1 === length ? 0 : selectedIndex + 1);
    })[0];
    const previousColor = selectedGroup.colors.filter(color => {
        return color.index === (selectedIndex === 0 ? length - 1 : selectedIndex - 1);
    })[0];

    updateColorToggle(colorToggleNext, nextColor, selectedGroup.meta.name, newValue.swapColorOrder);
    updateColorToggle(colorTogglePrevious, previousColor, selectedGroup.meta.name, newValue.swapColorOrder);
});

function updateColorToggle(toggle: HTMLElement, data: ColorInfo, categoryName: string, swapColorOrder: boolean): void {
    // Update colors
    (toggle.querySelector('.color-toggle-display.a') as HTMLElement)
        .style.backgroundColor = swapColorOrder ? data.clrB : data.clrA;
    (toggle.querySelector('.color-toggle-display.b') as HTMLElement)
        .style.backgroundColor = swapColorOrder ? data.clrA : data.clrB;

    toggle.dataset.colorInfo = JSON.stringify(data);
    toggle.dataset.categoryName = categoryName;
}

colorTogglePrevious.addEventListener('click', handleColorToggleClick);
colorToggleNext.addEventListener('click', handleColorToggleClick);

function handleColorToggleClick(e: MouseEvent): void {
    const colorInfo = (e.target as HTMLElement).dataset.colorInfo;
    const color: ColorInfo = JSON.parse(colorInfo);
    if (scoreboardData.value.colorInfo.index === color.index) return;
    scoreboardData.value.colorInfo = {
        ...color,
        categoryName: (e.target as HTMLElement).dataset.categoryName
    };
}
