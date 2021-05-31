const lastFmSettings = nodecg.Replicant('lastFmSettings');
const radiaSettings = nodecg.Replicant('radiaSettings');

const lastFmUsernameInput = document.getElementById('last-fm-username-input');
const lastFmUpdateBtn = document.getElementById('update-lastfm-data-btn');

const radiaGuildIDInput = document.getElementById('radia-guild-input');
const radiaUpdateBtn = document.getElementById('update-radia-data-btn');

lastFmSettings.on('change', (newValue) => {
    lastFmUsernameInput.value = newValue.username;
});

lastFmUpdateBtn.addEventListener('click', () => {
    lastFmSettings.value.username = lastFmUsernameInput.value;
});

addChangeReminder(
    document.querySelectorAll('.last-fm-update-reminder'),
    lastFmUpdateBtn
);

radiaSettings.on('change', (newValue) => {
	radiaGuildIDInput.value = newValue.guildID;
});

radiaUpdateBtn.addEventListener('click', () => {
	radiaSettings.value.guildID = radiaGuildIDInput.value;
});

addChangeReminder(
	document.querySelectorAll('.radia-update-reminder'),
	radiaUpdateBtn
);
