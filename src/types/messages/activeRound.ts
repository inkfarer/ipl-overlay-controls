import { GameWinner } from 'types/enums/gameWinner';
import { ActiveRoundGame } from 'types/activeRoundGame';
import { ColorInfo } from 'types/colors';

export interface UpdateActiveGamesRequest {
    games: ActiveRoundGame[]
}

export interface SetWinnerRequest {
    winner: GameWinner,
    roundIndex?: number
}

export interface SetActiveColorRequest {
    color: ColorInfo,
    categoryName: string
}
