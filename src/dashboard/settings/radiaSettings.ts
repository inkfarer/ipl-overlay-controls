import { RadiaSettings } from 'schemas';
import { addChangeReminder } from '../helpers/buttonHelper';
import { elementById } from '../helpers/elemHelper';

const radiaSettings = nodecg.Replicant<RadiaSettings>('radiaSettings');

const radiaGuildIDInput = <HTMLInputElement>document.getElementById('radia-guild-input');
const radiaUpdateBtn = <HTMLButtonElement>document.getElementById('update-radia-data-btn');
const autoTournamentUpdateToggle = elementById<HTMLInputElement>('auto-tournament-data-update-toggle');

radiaSettings.on('change', newValue => {
    radiaGuildIDInput.value = newValue.guildID;
    autoTournamentUpdateToggle.checked = newValue.updateOnImport;
});

radiaUpdateBtn.addEventListener('click', () => {
    radiaSettings.value.guildID = radiaGuildIDInput.value;
});

autoTournamentUpdateToggle.addEventListener('change', event => {
    const target = event.target as HTMLInputElement;
    radiaSettings.value.updateOnImport = target.checked;
});

addChangeReminder(
    document.querySelectorAll('.radia-update-reminder'),
    radiaUpdateBtn
);
