export function pluralizeWithoutCount(word: string, count: number, pluralWord?: string): string {
    if (count === 1) return word;
    else return !pluralWord ? `${word}s` : `${pluralWord}`;
}

export function extractBattlefyTournamentId(input: string): string {
    if (input.includes('/')) {
        const idIndex = /^http(s?):\/\//.test(input) ? 5 : 3;
        return input.split('/')[idIndex];
    } else return input;
}
