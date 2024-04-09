import { RuntimeConfig } from 'schemas';
import i18next, { type BackendModule } from 'i18next';

const I18nBackend: BackendModule = {
    type: 'backend',

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    init() {

    },

    async read(language, namespace) {
        return loadTranslation(language, namespace);
    },
};

export async function initI18n(namespaces: string | string[]): Promise<void> {
    const ns = Array.isArray(namespaces) ? [...namespaces, 'common']: [namespaces, 'common'];
    await i18next
        .use(I18nBackend)
        .init({
            lng: 'en',
            fallbackLng: 'en',
            ns
        });

    const runtimeConfig = nodecg.Replicant<RuntimeConfig>('runtimeConfig');
    runtimeConfig.on('change', async (newValue, oldValue) => {
        if (!oldValue || newValue.interfaceLocale !== oldValue.interfaceLocale) {
            await i18next.changeLanguage(newValue.interfaceLocale.toLowerCase()).catch(e => {
                console.error('Failed to change interface language', e);
            });
            if (i18next.exists('title')) {
                try {
                    window.frameElement.parentElement.setAttribute('display-title', i18next.t('title'));
                } catch (ignore) {

                }
            }
        }
    });
}

async function loadTranslation(locale: string, name: string) {
    try {
        return await import(`../../helpers/i18n/${locale.toLowerCase()}/${name}.json`);
    } catch (ignore) {
        return null;
    }
}
