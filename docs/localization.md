# Localization

ipl-overlay-controls can be translated to multiple languages using [i18next](https://www.i18next.com/).

## Adding a new language

- Add the language as an allowed value of `interfaceLocale` in `/schemas/runtimeConfig.json`
- Add a new type value in `/src/types/enums/InterfaceLocale.ts`
- Add translations to `/src/helpers/i18n/<language>`
  - `common.json` contains reusable translations
  - `server.json` contains translations used by the backend
  - Other files contain translations used by individual dashboard panels
