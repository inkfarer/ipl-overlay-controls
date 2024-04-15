export interface ColorInfo {
    index: number;
    title: string;
    key: string;
    clrA: string;
    clrB: string;
    clrNeutral: string;
    isCustom: boolean;
}

export interface ColorFinderOption {
    optionColor: string;
    matchingColorKeys: string[];
}

export interface ColorGroup {
    meta: { name: string, key: string };
    colors: ColorInfo[];
    colorFinderOptions?: ColorFinderOption[];
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
