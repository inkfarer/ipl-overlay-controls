export function addDots(value: string, maxLength = 48): string {
    const rolloff = '...';

    if (!value) return value;
    if (value.length > maxLength) {
        return value.substring(0, maxLength - rolloff.length) + rolloff;
    }

    return value;
}
