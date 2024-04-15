import i18next from 'i18next';

beforeAll(async () => {
    await i18next.init({
        lng: 'cimode',
        appendNamespaceToCIMode: true
    });
});
