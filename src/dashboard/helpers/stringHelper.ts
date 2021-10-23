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

export function padNumber(value: number | string, minLength = 2): string {
    const stringValue = String(value);
    if (stringValue.length < minLength) {
        return '0'.repeat(minLength - stringValue.length) + stringValue;
    } else {
        return stringValue;
    }
}
