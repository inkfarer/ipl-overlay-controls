import i18next from 'i18next';
import { config } from '@vue/test-utils';

jest.mock('i18next-vue', () => ({
    __esModule: true,
    useTranslation: () => ({ t: i18next.t })
}));

beforeAll(async () => {
    await i18next.init({
        lng: 'cimode',
        appendNamespaceToCIMode: true
    });
    config.global.mocks = {
        $t: i18next.t
    };
});
