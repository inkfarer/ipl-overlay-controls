export function pluralize(word: string, count: number, pluralWord?: string): string {
    const formattedCount = formatNumber(count);
    if (count === 1) return `${formattedCount} ${word}`;
    else return !pluralWord ? `${formattedCount} ${word}s` : `${formattedCount} ${pluralWord}`;
}

export function padNumber(value: number | string, minLength = 2): string {
    const stringValue = String(value);
    if (stringValue.length < minLength) {
        return '0'.repeat(minLength - stringValue.length) + stringValue;
    } else {
        return stringValue;
    }
}

export function formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
}

export function extractBattlefyTournamentId(input: string): string {
    if (input.includes('/')) {
        const idIndex = /^http(s?):\/\//.test(input) ? 5 : 3;
        return input.split('/')[idIndex];
    } else return input;
}
