import { GameWinner } from 'types/gameWinner';

export interface ActiveRoundGame {
    winner: GameWinner;
    stage: string;
    mode: string;
    color?: {
        index: number;
        title: string;
        clrA: string;
        clrB: string;
        categoryName: string;
        colorsSwapped: boolean;
    };
}
