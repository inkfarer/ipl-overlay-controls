import * as nodecgContext from '../helpers/nodecg';
import { RuntimeConfig } from '../../types/schemas';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import { SetGameVersionMessage } from '../../types/messages/runtimeConfig';
import { resetRoundStore } from '../helpers/roundStoreHelper';
import { resetMatchStore } from '../helpers/matchStoreHelper';
import { dependentBundles } from '../helpers/bundleHelper';
import { Locale } from '../../types/enums/Locale';
import { updateLocaleInfo } from './localeInfo';
import { GameVersion } from '../../types/enums/gameVersion';

const nodecg = nodecgContext.get();
const runtimeConfig = nodecg.Replicant<RuntimeConfig>('runtimeConfig');

nodecg.listenFor('setGameVersion', (data: SetGameVersionMessage, ack: UnhandledListenForCb) => {
    if (runtimeConfig.value.gameVersion === data.version) {
        return ack(null);
    }

    const incompatibleBundles = dependentBundles
        .filter(bundle => !bundle.compatibleGameVersions.includes(data.version))
        .map(bundle => bundle.name);

    runtimeConfig.value.gameVersion = data.version;
    resetRoundStore();
    resetMatchStore(true);
    updateLocaleInfo(runtimeConfig.value.locale as Locale, data.version);
    ack(null, { incompatibleBundles });
});

nodecg.listenFor('setLocale', (data: Locale) => {
    updateLocaleInfo(data, runtimeConfig.value.gameVersion as GameVersion);

    runtimeConfig.value.locale = data;
});
