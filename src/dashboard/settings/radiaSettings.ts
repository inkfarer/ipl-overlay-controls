import { RadiaSettings } from 'schemas';
import { addChangeReminder } from '../globalScripts';

const radiaSettings = nodecg.Replicant<RadiaSettings>('radiaSettings');

const radiaGuildIDInput = <HTMLInputElement>document.getElementById('radia-guild-input');
const radiaUpdateBtn = <HTMLButtonElement>document.getElementById('update-radia-data-btn');

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
