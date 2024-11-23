import type NodeCG from '@nodecg/types';
import { LocaleInfo, RuntimeConfig } from 'schemas';
import { Locale } from 'types/enums/Locale';
import { GameVersion } from 'types/enums/gameVersion';
import { perGameData } from '../../helpers/gameData/gameData';

export class LocaleInfoService {
    private localeInfo: NodeCG.ServerReplicant<LocaleInfo>;
    private runtimeConfig: NodeCG.ServerReplicant<RuntimeConfig>;

    constructor(nodecg: NodeCG.ServerAPI) {
        this.localeInfo = nodecg.Replicant<LocaleInfo>('localeInfo', { persistent: false });
        this.runtimeConfig = nodecg.Replicant<RuntimeConfig>('runtimeConfig');
    }

    initLocaleInfo() {
        this.updateLocaleInfo(
            this.runtimeConfig.value.locale,
            this.runtimeConfig.value.gameVersion);
    }

    updateLocaleInfo(locale: Locale | `${Locale}`, gameVersion: GameVersion | `${GameVersion}`) {
        const gameData = perGameData[gameVersion];

        this.localeInfo.value = {
            stages: gameData.stages[locale],
            modes: gameData.modes[locale]
        };
    }
}
