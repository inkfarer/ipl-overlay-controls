import { RuntimeConfig } from 'schemas';
import i18next from 'i18next';
import type { Resource } from 'i18next/typescript/options';
import { InterfaceLocale } from 'types/enums/InterfaceLocale';

export async function initI18n(translationFileName: string): Promise<void> {
    await i18next.init({
        lng: 'en',
        fallbackLng: 'en',
        resources: await loadTranslations(translationFileName)
    });

    const runtimeConfig = nodecg.Replicant<RuntimeConfig>('runtimeConfig');
    runtimeConfig.on('change', (newValue, oldValue) => {
        if (!oldValue || newValue.interfaceLocale !== oldValue.interfaceLocale) {
            i18next.changeLanguage(newValue.interfaceLocale.toLowerCase()).catch(e => {
                console.error('Failed to change interface language', e);
            });
        }
    });
}

async function loadTranslations(name: string): Promise<Resource> {
    const result: Resource = { };
    for (const locale of Object.values(InterfaceLocale)) {
        result[locale.toLowerCase()] = {
            common: await loadTranslation(locale, 'common'),
            translation: await loadTranslation(locale, name)
        };
    }

    return result;
}

async function loadTranslation(locale: string, name: string) {
    try {
        return await import(`../../helpers/i18n/${locale.toLowerCase()}/${name}.json`);
    } catch (ignore) {
        return null;
    }
}
