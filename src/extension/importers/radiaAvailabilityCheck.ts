import * as nodecgContext from '../helpers/nodecg';
import { RadiaSettings } from '../../types/schemas';
import { getGuildInfo } from './clients/radiaClient';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';

const nodecg = nodecgContext.get();

const radiaSettings = nodecg.Replicant<RadiaSettings>('radiaSettings');

async function checkGuildInfo(guildId: string) {
    try {
        const guildInfo = await getGuildInfo(guildId);

        radiaSettings.value.enabled = true;
        radiaSettings.value.connectedChannel = guildInfo.twitch_channel;
    } catch (e) {
        radiaSettings.value.enabled = false;
        radiaSettings.value.connectedChannel = null;
    }
}

radiaSettings.on('change', (newValue, oldValue) => {
    if (newValue.guildID !== oldValue?.guildID) {
        return checkGuildInfo(newValue.guildID);
    }
});

nodecg.listenFor('retryRadiaAvailabilityCheck', async (data: never, ack: UnhandledListenForCb) => {
    await checkGuildInfo(radiaSettings.value.guildID);
    return ack(null, null);
});
