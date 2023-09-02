import type NodeCG from '@nodecg/types';
import { BaseController } from './BaseController';
import { RuntimeConfig } from 'schemas';
import { dependentBundles } from '../helpers/bundleHelper';
import { resetRoundStore } from '../helpers/roundStoreHelper';
import { resetMatchStore } from '../helpers/matchStoreHelper';
import { Locale } from 'types/enums/Locale';
import { GameVersion } from 'types/enums/gameVersion';
import { LocaleInfoService } from '../services/LocaleInfoService';
import { AssetPathService } from '../services/AssetPathService';

export class RuntimeConfigController extends BaseController {
    constructor(nodecg: NodeCG.ServerAPI, localeInfoService: LocaleInfoService, assetPathService: AssetPathService) {
        super(nodecg);

        const runtimeConfig = nodecg.Replicant<RuntimeConfig>('runtimeConfig');

        this.listen('setGameVersion', data => {
            if (runtimeConfig.value.gameVersion === data.version) {
                return null;
            }

            const incompatibleBundles = dependentBundles
                .filter(bundle => !bundle.compatibleGameVersions.includes(data.version))
                .map(bundle => bundle.name);

            runtimeConfig.value.gameVersion = data.version;
            localeInfoService.updateLocaleInfo(runtimeConfig.value.locale as Locale, data.version);
            assetPathService.updateAssetPaths(data.version);
            resetRoundStore();
            resetMatchStore(true);
            return { incompatibleBundles };
        });

        this.listen('setLocale', locale => {
            localeInfoService.updateLocaleInfo(locale, runtimeConfig.value.gameVersion as GameVersion);

            runtimeConfig.value.locale = locale;
        });
    }
}