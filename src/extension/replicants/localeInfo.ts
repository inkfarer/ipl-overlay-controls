import * as nodecgContext from '../helpers/nodecg';
import { LocaleInfo, RuntimeConfig } from '../../types/schemas';
import { Locale } from '../../types/enums/Locale';
import { GameVersion } from '../../types/enums/gameVersion';
import { perGameData } from '../../helpers/gameData/gameData';

const nodecg = nodecgContext.get();

const localeInfo = nodecg.Replicant<LocaleInfo>('localeInfo');

export function initLocaleInfoIfNeeded(runtimeConfig: RuntimeConfig): void {
    if (Object.keys(localeInfo.value.modes).length <= 0 && Object.keys(localeInfo.value.stages).length <= 0) {
        updateLocaleInfo(runtimeConfig.locale as Locale, runtimeConfig.gameVersion as GameVersion);
    }
}

export function updateLocaleInfo(locale: Locale, gameVersion: GameVersion): void {
    const gameData = perGameData[gameVersion];

    localeInfo.value = {
        stages: gameData.stages[locale],
        modes: gameData.modes[locale]
    };
}
