export function getContrastingTextColor(backgroundColor: string, lightColor = 'white', darkColor = '#333'): string {
    if (!backgroundColor) return null;
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
