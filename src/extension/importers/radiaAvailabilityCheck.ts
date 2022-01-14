import * as nodecgContext from '../helpers/nodecg';
import { RadiaSettings } from '../../types/schemas';
import { getGuildInfo } from './clients/radiaClient';

const nodecg = nodecgContext.get();

const radiaSettings = nodecg.Replicant<RadiaSettings>('radiaSettings');

radiaSettings.on('change', async (newValue, oldValue) => {
    if (newValue.guildID !== oldValue?.guildID) {
        try {
            const guildInfo = await getGuildInfo(newValue.guildID);

            radiaSettings.value.enabled = true;
            radiaSettings.value.connectedChannel = guildInfo.twitch_channel;
        } catch (e) {
            radiaSettings.value.enabled = false;
            radiaSettings.value.connectedChannel = null;
        }
    }
});
