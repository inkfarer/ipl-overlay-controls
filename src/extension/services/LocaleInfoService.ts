import type { NodeCG, ReplicantServer } from 'nodecg/server';
import { LocaleInfo, RuntimeConfig } from 'schemas';
import { Locale } from 'types/enums/Locale';
import { GameVersion } from 'types/enums/gameVersion';
import { perGameData } from '../../helpers/gameData/gameData';

export class LocaleInfoService {
    private localeInfo: ReplicantServer<LocaleInfo>;
    private runtimeConfig: ReplicantServer<RuntimeConfig>;

    constructor(nodecg: NodeCG) {
        this.localeInfo = nodecg.Replicant<LocaleInfo>('localeInfo');
        this.runtimeConfig = nodecg.Replicant<RuntimeConfig>('runtimeConfig');
    }

    initIfNeeded() {
        if (
            Object.keys(this.localeInfo.value.modes).length <= 0
            && Object.keys(this.localeInfo.value.stages).length <= 0
        ) {
            this.updateLocaleInfo(
                this.runtimeConfig.value.locale as Locale,
                this.runtimeConfig.value.gameVersion as GameVersion);
        }
    }

    updateLocaleInfo(locale: Locale, gameVersion: GameVersion) {
        const gameData = perGameData[gameVersion];

        this.localeInfo.value = {
            stages: gameData.stages[locale],
            modes: gameData.modes[locale]
        };
    }
}
