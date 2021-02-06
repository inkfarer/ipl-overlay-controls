const lastFmSettings = nodecg.Replicant('lastFmSettings');
const lastFmUsernameInput = document.getElementById('last-fm-username-input');
const lastFmUpdateBtn = document.getElementById('update-lastfm-data-btn');

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
