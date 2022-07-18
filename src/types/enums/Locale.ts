export enum Locale {
    EN = 'EN',
    DE = 'DE'
}

export class LocaleHelper {
    static toPrettyString(locale: Locale): string {
        return {
            [Locale.EN]: 'English',
            [Locale.DE]: 'Deutsch'
        }[locale];
    }
}
