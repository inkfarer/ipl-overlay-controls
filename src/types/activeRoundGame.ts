import { GameWinnerValues } from './enums/gameWinner';

export interface ActiveRoundGame {
    winner: GameWinnerValues;
    stage: string;
    mode: string;
    color?: {
        index: number;
        title: string;
        colorKey: string;
        clrA: string;
        clrB: string;
        clrNeutral: string;
        categoryName: string;
        categoryKey: string;
        colorsSwapped: boolean;
        isCustom: boolean;
    };
    [k: string]: unknown;
}
