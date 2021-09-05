import { LastFmSettings } from 'schemas';
import { addChangeReminder } from '../helpers/buttonHelper';

const lastFmSettings = nodecg.Replicant<LastFmSettings>('lastFmSettings');

const lastFmUsernameInput = <HTMLInputElement>document.getElementById('last-fm-username-input');
const lastFmUpdateBtn = <HTMLButtonElement>document.getElementById('update-lastfm-data-btn');

lastFmSettings.on('change', newValue => {
    lastFmUsernameInput.value = newValue.username;
});

lastFmUpdateBtn.addEventListener('click', () => {
    lastFmSettings.value.username = lastFmUsernameInput.value;
});

addChangeReminder(
    document.querySelectorAll('.last-fm-update-reminder'),
    lastFmUpdateBtn
);
