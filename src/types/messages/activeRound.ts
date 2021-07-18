import { GameWinner } from 'types/gameWinner';
import { ActiveRoundGame } from 'types/activeRoundGame';

export interface UpdateActiveGamesRequest {
    games: ActiveRoundGame[]
}

export interface SetWinnerRequest {
    winner: GameWinner,
    roundIndex?: number
}
