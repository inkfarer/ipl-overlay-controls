import { GameWinner } from '../types/gameWinner';

export function createEmptyGameData(size: number) {
    return Array(size).fill({ winner: GameWinner.NO_WINNER });
}
