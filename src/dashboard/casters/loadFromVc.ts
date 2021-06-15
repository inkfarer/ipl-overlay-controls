import { setUncommittedButtonDisabled, updateOrCreateCreateCasterElem } from './casters';
import { RadiaSettings } from 'types/schemas';

const radiaSettings = nodecg.Replicant<RadiaSettings>('radiaSettings');

const btnLoadFromVC = document.getElementById('load-casters-btn') as HTMLButtonElement;

btnLoadFromVC.addEventListener('click', () => {
    nodecg.sendMessage('getLiveCommentators', {}, (e, result) => {
        if (e) {
            console.error(e);
            return;
        }

        if (result.extra && result.extra.length > 0) {
            for (let i = 0; i < result.extra.length; i++) {
                const extraCaster = result.extra[i];
                updateOrCreateCreateCasterElem(extraCaster.discord_user_id, extraCaster, true);
            }

            setUncommittedButtonDisabled(true);
        } else {
            setUncommittedButtonDisabled(false);
        }
    });
});

radiaSettings.on('change', newValue => {
    // If the api isn't enabled we disable the "load from vc" button
    btnLoadFromVC.disabled = !(newValue.enabled && newValue.guildID);
});
