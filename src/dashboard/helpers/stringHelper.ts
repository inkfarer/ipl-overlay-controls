export function addDots(value: string, maxLength = 48): string {
    const rolloff = '...';

    if (!value) return value;
    if (value.length > maxLength) {
        return value.substring(0, maxLength - rolloff.length) + rolloff;
    }

    return value;
}

export function pluralize(word: string, count: number, pluralWord?: string): string {
    if (count === 1) return `${count} ${word}`;
    else return !pluralWord ? `${count} ${word}s` : `${count} ${pluralWord}`;
}
