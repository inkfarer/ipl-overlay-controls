import * as nodecgContext from '../helpers/nodecg';
import { RuntimeConfig } from '../../types/schemas';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import { SetGameVersionMessage } from '../../types/messages/runtimeConfig';
import { resetRoundStore } from '../helpers/roundStoreHelper';
import { resetMatchStore } from '../helpers/matchStoreHelper';

const nodecg = nodecgContext.get();

const runtimeConfig = nodecg.Replicant<RuntimeConfig>('runtimeConfig');

nodecg.listenFor('setGameVersion', (data: SetGameVersionMessage, ack: UnhandledListenForCb) => {
    if (runtimeConfig.value.gameVersion === data.version) {
        return ack(null);
    }

    runtimeConfig.value.gameVersion = data.version;
    resetRoundStore();
    resetMatchStore(true);
    ack(null);
});
