import i18next from 'i18next';

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

export function extractSendouInkTournamentId(input: string): string {
    if (input.includes('sendou.ink')) {
        const idIndex = /^http(s?):\/\//.test(input) ? 4 : 2;
        const path = input.split('/');
        if (idIndex + 1 > path.length) {
            throw new Error(i18next.t('common:stringHelper.invalidSendouInkTournamentUrlError'));
        }

        return path[idIndex];
    } else return input;
}
