import { GameWinner } from 'types/enums/gameWinner';
import { ActiveRoundGame } from 'types/activeRoundGame';
import { ColorInfo } from 'types/colors';

export type ColorWithCategory = ColorInfo & { categoryName: string };

export interface UpdateActiveGamesRequest {
    games: ActiveRoundGame[];
}

export interface SetWinnerRequest {
    winner: GameWinner;
    roundIndex?: number;
}

export interface SetActiveColorRequest {
    color: ColorInfo;
    categoryName: string;
}

export interface SwapRoundColorRequest {
    roundIndex: number;
    colorsSwapped: boolean;
}

export interface BeginNextMatchRequest {
    matchName?: string;
}

export interface GetNextAndPreviousColorsResponse {
    nextColor: ColorWithCategory
    previousColor: ColorWithCategory
}
