export interface ColorInfo {
    index: number;
    title: string;
    key: string;
    clrA: string;
    clrB: string;
    // "Reference Colors" are closer to the real colors displayed in the game UI
    // They can be defined to help automatically define the ink colors while still
    // displaying a different color in the graphics
    referenceClrA?: string;
    referenceClrB?: string;
    clrNeutral: string;
    isCustom: boolean;
}

export interface ColorGroup {
    meta: { name: string, key: string };
    colors: ColorInfo[];
}

export interface GameColor {
    clrA: string;
    clrB: string;
    clrNeutral: string;
    index: number;
    categoryName: string;
    colorsSwapped: boolean;
    isCustom: boolean;
}
