import { addChangeReminder } from '../globalScripts';
import '../globalStyles.css';
import { NodeCGBrowser } from 'nodecg/browser';
import { LastFmSettings, RadiaSettings } from 'schemas';

const lastFmSettings = nodecg.Replicant<LastFmSettings>('lastFmSettings');
const radiaSettings = nodecg.Replicant<RadiaSettings>('radiaSettings');

const lastFmUsernameInput = <HTMLInputElement>document.getElementById('last-fm-username-input');
const lastFmUpdateBtn = <HTMLButtonElement>document.getElementById('update-lastfm-data-btn');

const radiaGuildIDInput = <HTMLInputElement>document.getElementById('radia-guild-input');
const radiaUpdateBtn = <HTMLButtonElement>document.getElementById('update-radia-data-btn');

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

radiaSettings.on('change', newValue => {
    radiaGuildIDInput.value = newValue.guildID;
});

radiaUpdateBtn.addEventListener('click', () => {
    radiaSettings.value.guildID = radiaGuildIDInput.value;
});

addChangeReminder(
    document.querySelectorAll('.radia-update-reminder'),
    radiaUpdateBtn
);
