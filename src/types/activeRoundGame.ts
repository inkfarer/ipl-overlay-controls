import { GameWinner } from 'types/enums/gameWinner';

export interface ActiveRoundGame {
    winner: GameWinner;
    stage: string;
    mode: string;
    color?: {
        index: number;
        title: string;
        clrA: string;
        clrB: string;
        clrNeutral: string;
        categoryName: string;
        colorsSwapped: boolean;
        isCustom: boolean;
    };
    [k: string]: unknown;
}
