export interface ColorInfo {
    index: number;
    title: string;
    key: string;
    clrA: string;
    clrB: string;
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
