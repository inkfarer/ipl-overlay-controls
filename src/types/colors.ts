export interface ColorInfo {
    index: number;
    title: string;
    clrA: string;
    clrB: string;
    isCustom: boolean;
}

export interface ColorGroup {
    meta: { name: string };
    colors: ColorInfo[];
}

export interface GameColor {
    clrA: string;
    clrB: string;
    index: number;
    categoryName: string;
    colorsSwapped: boolean;
    isCustom: boolean;
}
