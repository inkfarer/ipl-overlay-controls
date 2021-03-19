const gameWinners = nodecg.Replicant('gameWinners');
const activeRoundId = nodecg.Replicant('activeRoundId');

const rounds = nodecg.Replicant('rounds');

const roundNameElem = document.getElementById('round-name');
const roundUpdateButton = document.getElementById('update-round');

NodeCG.waitForReplicants(gameWinners, rounds).then(() => {
    activeRoundId.on('change', newValue => {
		let currentRound = rounds.value[newValue];

		if (currentRound) {
            addRoundToggles(currentRound.games, currentRound.meta.name);
        } else {
            removeToggles();
            roundNameElem.innerText =
                'Undefined (Round might have been deleted...)';
        }
    });

    gameWinners.on('change', (newValue) => {
        disableWinButtons(newValue);
    });

    rounds.on('change', (newValue, oldValue) => {
        if (!oldValue) return;

        const newCurrentRound = newValue[activeRoundId.value];
        const oldCurrentRound = oldValue[activeRoundId.value];

        if (!newCurrentRound) return;

        if (newCurrentRound.meta.name !== oldCurrentRound.meta.name) {
			roundNameElem.innerText = newCurrentRound.meta.name;
        }

        for (let i = 0; i < newCurrentRound.games.length; i++) {
            const newGame = newCurrentRound.games[i];
            const oldGame = oldCurrentRound.games[i];

            if (newGame.mode !== oldGame.mode || oldGame.stage !== newGame.stage) {
                updateMapsModes(i, newGame);
                break;
            }
        }
    });
});

function updateMapsModes(index, data) {
	const stageSelector = document.getElementById(`stage-selector_${index}`);
	stageSelector.value = data.stage;

	const modeSelector = document.getElementById(`mode-selector_${index}`);
	modeSelector.value = data.mode;
}

function addRoundToggles(games, roundName) {
    removeToggles();
    roundNameElem.innerText = roundName;
    for (let i = 0; i < games.length; i++) {
        const element = games[i];
        addToggle(element, i);
    }
}

function addToggle(roundElement, stageIndex) {
    const toggleDiv = document.createElement('div');
    toggleDiv.classList.add('toggles');
    const stageModeDisplay = document.createElement('div');

    stageModeDisplay.innerHTML =
		`<div class="separator"><span>${Number(stageIndex) + 1}</span></div>`;
    toggleDiv.appendChild(stageModeDisplay);

	const reminderCreatingElements = [];
	const stageSelector = document.createElement('select');
	stageSelector.id = `stage-selector_${stageIndex}`;
	stageSelector.classList.add('stage-selector');
	fillList(stageSelector, splatStages);
	stageSelector.value = roundElement.stage;
	toggleDiv.appendChild(stageSelector);
	reminderCreatingElements.push(stageSelector);

	const modeSelector = document.createElement('select');
	modeSelector.id = `mode-selector_${stageIndex}`;
	modeSelector.classList.add('mode-selector');
	fillList(modeSelector, splatModes);
	modeSelector.value = roundElement.mode;
	toggleDiv.appendChild(modeSelector);
	reminderCreatingElements.push(modeSelector);

	addChangeReminder(reminderCreatingElements, roundUpdateButton);

    const noWinButton = document.createElement('button');
    noWinButton.classList.add('no-win-toggle');
    noWinButton.classList.add('max-width');
    noWinButton.id = 'no-win-toggle_' + stageIndex;
    noWinButton.innerText = 'NO WIN';
    noWinButton.disabled = true;
    toggleDiv.appendChild(noWinButton);

    const AWinButton = document.createElement('button');
    AWinButton.classList.add('team-a-win-toggle');
    AWinButton.classList.add('green');
    AWinButton.classList.add('max-width');
    AWinButton.id = 'team-a-win-toggle_' + stageIndex;
    AWinButton.innerText = 'A WIN';

    const BWinButton = document.createElement('button');
    BWinButton.classList.add('team-b-win-toggle');
    BWinButton.classList.add('red');
    BWinButton.classList.add('max-width');
    BWinButton.id = 'team-b-win-toggle_' + stageIndex;
    BWinButton.innerText = 'B WIN';

    noWinButton.onclick = (event) => {
        const stageIndex = event.target.id.split('_')[1];
        gameWinners.value[stageIndex] = 0;
    };
    AWinButton.onclick = (event) => {
        const stageIndex = event.target.id.split('_')[1];
        gameWinners.value[stageIndex] = 1;
    };
    BWinButton.onclick = (event) => {
        const stageIndex = event.target.id.split('_')[1];
        gameWinners.value[stageIndex] = 2;
    };

    const winButtonContainer = document.createElement('div');
    winButtonContainer.classList.add('win-picker-container');
    winButtonContainer.appendChild(AWinButton);
    winButtonContainer.appendChild(BWinButton);
    toggleDiv.appendChild(winButtonContainer);

    document.getElementById('toggles').appendChild(toggleDiv);
}

document.getElementById('reset-btn').onclick = () => {
    gameWinners.value = [0, 0, 0, 0, 0, 0, 0];
};

function getButtons(id) {
    const noWinButton = document.querySelector('#no-win-toggle_' + id);
    const AWinButton = document.querySelector('#team-a-win-toggle_' + id);
    const BWinButton = document.querySelector('#team-b-win-toggle_' + id);
    return [noWinButton, AWinButton, BWinButton];
}

function disableWinButtons(gameWinnerValue) {
    var currentRound = rounds.value[activeRoundId.value];

    for (let i = 1; i < currentRound.games.length + 1; i++) {
        const gameWinner = gameWinnerValue[i - 1];
        const buttons = getButtons(i - 1);
        for (let y = 0; y < buttons.length; y++) {
            buttons[y].disabled = false;
        }
        buttons[gameWinner].disabled = true;
    }
}

function removeToggles() {
    document.getElementById('toggles').innerHTML = '';
}

// set wins automatically check box
const setWinnersAutomatically = nodecg.Replicant('setWinnersAutomatically');

setWinnersAutomatically.on('change', (newValue) => {
    document.getElementById('auto-winner-set-toggle').checked = newValue;
});

roundUpdateButton.addEventListener('click', () => {
	const numberOfGames = rounds.value[activeRoundId.value].games.length;
	const games = [];

	for (let i = 0; i < numberOfGames; i++) {
		const currentGame = {
			stage: '',
			mode: '',
		};
		const stageSelector = document.getElementById(
			`stage-selector_${i}`
		);
		currentGame.stage = stageSelector.value;

		const modeSelector = document.getElementById(`mode-selector_${i}`);
		currentGame.mode = modeSelector.value;
		games.push(currentGame);
	}

	rounds.value[activeRoundId.value].games = games;
});
