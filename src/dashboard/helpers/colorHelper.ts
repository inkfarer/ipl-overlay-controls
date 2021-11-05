import { colors, getColorOptionName } from '../../helpers/splatoonData';

export function fillColorSelector(select: HTMLSelectElement): void {
    for (let i = 0; i < colors.length; i++) {
        const element = colors[i];

        const optGroup = document.createElement('optgroup');
        optGroup.label = element.meta.name;

        for (let j = 0; j < element.colors.length; j++) {
            const color = element.colors[j];

            const option = document.createElement('option');
            option.value = getColorOptionName(color.index, element.meta.name);
            option.text = color.title;
            option.dataset.index = String(color.index);
            option.dataset.firstColor = color.clrA;
            option.dataset.secondColor = color.clrB;
            option.dataset.categoryName = element.meta.name;
            option.disabled = color.isCustom;

            optGroup.appendChild(option);
        }

        select.appendChild(optGroup);
    }
}

export function getContrastingTextColor(backgroundColor: string, lightColor = 'white', darkColor = '#333'): string {
    const { r, g, b } = hexToRbg(backgroundColor);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? darkColor : lightColor;
}

export function hexToRbg(color: string): { r: number, g: number, b: number } {
    color = color.replace('#', '');
    return {
        r: parseInt(color.substr(0, 2), 16),
        g: parseInt(color.substr(2, 2), 16),
        b: parseInt(color.substr(4, 2), 16)
    };
}
