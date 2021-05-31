const radiaSettings = nodecg.Replicant('radiaSettings');
const radiaGuildIDInput = document.getElementById('radia-guild-input');
const radiaUpdateBtn = document.getElementById('update-radia-data-btn');
const importBtn = document.getElementById('import-radia-data-btn');

radiaSettings.on('change', (newValue) => {
	radiaGuildIDInput.value = newValue.guildID;
});

radiaUpdateBtn.addEventListener('click', () => {
	radiaSettings.value.guildID = radiaGuildIDInput.value;
});

importBtn.onclick = () => {
	nodecg.sendMessage(
		'getLiveCommentators', {},
		(e, result) => {
			console.log(result)
			if (e) {
				console.error(e);
			}
		}
	);
};

addChangeReminder(
	document.querySelectorAll('.radia-update-reminder'),
	radiaUpdateBtn
);
