import { MatchStore } from '../types/schemas';

export function generateMatchNameForRound(matchStore: MatchStore, roundName: string): string {
    const matchCountForName = Object.values(matchStore).filter(match => match.meta.name === roundName).length;

    if (matchCountForName <= 0) {
        return roundName;
    } else {
        return `${roundName} (${matchCountForName + 1})`;
    }
}
