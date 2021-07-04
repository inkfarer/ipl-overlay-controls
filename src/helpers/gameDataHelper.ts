import { GameWinner } from '../types/gameWinner';
import { GameData } from '../../schemas';

export function createEmptyGameData(size: number): GameData {
    return Array(size).fill({ winner: GameWinner.NO_WINNER });
}
