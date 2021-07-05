import { colors } from '../../helpers/splatoonData';
import { ColorInfo } from 'types/colorInfo';

export function fillColorSelector(select: HTMLSelectElement): void {
    for (let i = 0; i < colors.length; i++) {
        const element = colors[i];

        const optGroup = document.createElement('optgroup');
        optGroup.label = element.meta.name;

        for (let j = 0; j < element.colors.length; j++) {
            const color = element.colors[j];

            const option = document.createElement('option');
            option.value = getColorOptionName(color, element.meta.name);
            option.text = color.title;
            option.dataset.index = String(color.index);
            option.dataset.firstColor = color.clrA;
            option.dataset.secondColor = color.clrB;
            option.dataset.categoryName = element.meta.name;
            // Make custom color unselectable by user
            option.disabled = color.index === 999;

            optGroup.appendChild(option);
        }

        select.appendChild(optGroup);
    }
}

export function formatColorCategoryName(name: string): string {
    return name.replace(' ', '-').toLowerCase();
}

export function getColorOptionName(color: ColorInfo, categoryName: string): string {
    return `${formatColorCategoryName(categoryName)}_${color.index}`;
}

export function getContrastingTextColor(backgroundColor: string): string {
    backgroundColor = backgroundColor.replace('#', '');
    const r = parseInt(backgroundColor.substr(0, 2), 16);
    const g = parseInt(backgroundColor.substr(2, 2), 16);
    const b = parseInt(backgroundColor.substr(4, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#333' : 'white';
}
