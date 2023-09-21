export enum Locale {
    EN = 'EN',
    DE = 'DE',
    EU_FR = 'EU_FR'
}

export class LocaleHelper {
    static toPrettyString(locale: Locale): string {
        return {
            [Locale.EN]: 'English',
            [Locale.DE]: 'Deutsch',
            [Locale.EU_FR]: 'Français'
        }[locale];
    }
}
