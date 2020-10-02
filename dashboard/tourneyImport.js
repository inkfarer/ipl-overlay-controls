const battlefyData = nodecg.Replicant('tourneyData', {
	defaultValue: [
		{tourneyId: "none"},
		{
			name: "Placeholder Team 1",
			logoUrl: "",
			players: [
				{name:"You should fix this before going live.", username: "You should fix this before going live."}
			]
		},
		{
			name: "Placeholder Team 2",
			logoUrl: "",
			players: [
				{name:"You should fix this before going live.", username: "You should fix this before going live."}
			]
		}
	]
});

const maxNameLength = 48;

submitId.onclick = () => {
	setStatusLoading();
	const requestURL = "https://dtmwra1jsgyb0.cloudfront.net/tournaments/" + tourneyIdInput.value + "/teams";
	fetch(requestURL, {})
			.then(response => {
				return response.json();
			})
			.then (data => {
				if (data.error) {
					setStatusFailure();
					return;
				}
				//console.log(data);
				let teams = [{tourneyId: tourneyIdInput.value}];
				//we don't care about most of this data
				//so hey, let's save a kilobyte of memory while we're here
				for (let i = 0; i < data.length; i++) {
					const element = data[i];
					var teamInfo = {
						name: addDots(element.name),
						logoUrl: element.persistentTeam.logoUrl,
						players: []
					}
					for (let j = 0; j < element.players.length; j++) {
						const elementPlayer = element.players[j];
						let playerInfo = {
							name: addDots(elementPlayer.inGameName),
							//just in case...
							//why does everybody have like, three names?
							username: addDots(elementPlayer.username)
						};
						teamInfo.players.push(playerInfo);
					}
					teams.push(teamInfo);
				}
				//console.log(teams);
				battlefyData.value = teams;
				setStatusSuccess();
			})
			.catch(err => {
				console.error(err);
				setStatusFailure();
			});
}

function addDots(string) {
	if (!string) return string;
	if (string.length >= maxNameLength) return string.substring(0, maxNameLength) + '...';
	else return string;
}

tourneyIdInput.addEventListener('input', (event) => {
	//check for id matches - prevent unnecessary imports
	if (event.target.value === battlefyData.value[0].tourneyId) {
		loadedDisplay.style.backgroundColor = "var(--green)";
	} else {
		loadedDisplay.style.backgroundColor = "#181E29";
	}
})

battlefyData.on('change', (newValue) => {
	//console.log(newValue);
	if (newValue[0].tourneyId) {
		nowLoaded.innerText = newValue[0].tourneyId;
	} else {
		nowLoaded.innerText = "none";
	}
})

function setStatusLoading() {
	submitStatus.style.backgroundColor = "var(--yellow)";
	submitStatus.style.color = "#000";
	submitStatus.innerText = "LOADING";
}

function setStatusSuccess() {
	submitStatus.style.backgroundColor = "var(--green)";
	submitStatus.style.color = "#fff";
	submitStatus.innerText = "SUCCESS";
}

function setStatusFailure() {
	submitStatus.style.backgroundColor = "var(--red)";
	submitStatus.style.color = "#fff";
	submitStatus.innerText = "FAIL";
}