import { GameWinner } from '../types/enums/gameWinner';
import { GameData } from '../types/schemas';

export function createEmptyGameData(size: number): GameData {
    return Array(size).fill({ winner: GameWinner.NO_WINNER });
}
