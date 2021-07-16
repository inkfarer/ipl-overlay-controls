import { GameWinner } from 'types/gameWinner';

export interface SetActiveRoundRequest {
    roundId: string
}

export interface SetWinnerRequest {
    winner: GameWinner,
    roundIndex?: number
}
