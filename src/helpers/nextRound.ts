import { MatchStore } from '../types/schemas';

export function generateMatchNameForRound(matchStore: MatchStore, roundId: string, roundName: string): string {
    const matchCountForId = Object.values(matchStore).filter(match => match.meta.relatedRoundId === roundId).length;

    if (matchCountForId <= 0) {
        return roundName;
    } else {
        return `${roundName} (${matchCountForId + 1})`;
    }
}
