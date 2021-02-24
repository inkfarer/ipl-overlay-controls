const rounds = nodecg.Replicant('rounds');

const activeRoundId = nodecg.Replicant('activeRoundId');

const splatStages = [
    'Ancho-V Games',
    'Arowana Mall',
    'Blackbelly Skatepark',
    'Camp Triggerfish',
    'Goby Arena',
    'Humpback Pump Track',
    'Inkblot Art Academy',
    'Kelp Dome',
    'MakoMart',
    'Manta Maria',
    'Moray Towers',
    'Musselforge Fitness',
    'New Albacore Hotel',
    'Piranha Pit',
    'Port Mackerel',
    'Shellendorf Institute',
    'Shifty Station',
    'Snapper Canal',
    'Starfish Mainstage',
    'Sturgeon Shipyard',
    'The Reef',
    'Wahoo World',
    'Walleye Warehouse',
    'Skipper Pavilion',
    'Unknown Stage',
];
splatStages.sort();

const splatModes = [
    'Clam Blitz',
    'Tower Control',
    'Rainmaker',
    'Splat Zones',
    'Turf War',
    'Unknown Mode',
];
splatModes.sort();

//perhaps a little overcomplicated but it will do
function generateId() {
    return '' + Math.random().toString(36).substr(2, 9);
}

document.getElementById('create-3-game-round').onclick = () => {
    createRoundElem(3, generateId(), true);
};

document.getElementById('create-5-game-round').onclick = () => {
    createRoundElem(5, generateId(), true);
};

document.getElementById('create-7-game-round').onclick = () => {
    createRoundElem(7, generateId(), true);
};

document.getElementById('reset-rounds').onclick = () => resetRounds();

function resetRounds() {
    rounds.value = {
        0: {
            meta: {
                name: 'Default round',
            },
            games: [
                { stage: 'MakoMart', mode: 'Clam Blitz' },
                { stage: 'Ancho-V Games', mode: 'Tower Control' },
                { stage: 'Wahoo World', mode: 'Rainmaker' },
            ],
        },
    };
    activeRoundId.value = '0';
}

function createRoundElem(numberOfGames, id, remindToUpdate) {
    //support up to 7 games for the time being
    //if you want me dead, host a tournament with 9 games in the finals
    if (
        typeof numberOfGames !== 'number' ||
        numberOfGames >= 8 ||
        numberOfGames <= 0
    ) {
        throw 'Rounds with only up to 7 stages are supported.';
    }

    const reminderCreatingElements = [];
    const roundElem = document.createElement('div');
    roundElem.classList.add('space');
    roundElem.classList.add('round');
    roundElem.id = `round_${id}`;

    // name input
    const nameInput = document.createElement('input');
    nameInput.id = `name-input_${id}`;
    nameInput.value = `Round ${id}`;
    nameInput.type = 'text';

    const nameInputLabel = document.createElement('div');
    nameInputLabel.innerText = 'Round name';
    nameInputLabel.classList.add('input-label');

    reminderCreatingElements.push(nameInput);
    roundElem.appendChild(nameInputLabel);
    roundElem.appendChild(nameInput);

    for (let i = 0; i < numberOfGames; i++) {
        //separator
        const separator = document.createElement('div');
        separator.classList.add('separator');
        const separatorSpan = document.createElement('span');
        separatorSpan.innerText = i + 1;
        separator.appendChild(separatorSpan);
        roundElem.appendChild(separator);

        //stage select
        const stageSelector = document.createElement('select');
        stageSelector.id = `stage-selector_${id}_${i}`;
        stageSelector.classList.add('stage-selector');
        fillList(stageSelector, splatStages);
        roundElem.appendChild(stageSelector);
        reminderCreatingElements.push(stageSelector);

        //mode select
        const modeSelector = document.createElement('select');
        modeSelector.id = `mode-selector_${id}_${i}`;
        modeSelector.classList.add('mode-selector');
        fillList(modeSelector, splatModes);
        roundElem.appendChild(modeSelector);
        reminderCreatingElements.push(modeSelector);
    }

    // update button
    const updateButton = document.createElement('button');
    updateButton.innerText = 'update';
    updateButton.id = `update-round_${id}`;
    if (remindToUpdate) {
        updateButton.style.backgroundColor = 'var(--red)';
    }
    updateButton.onclick = (event) => {
        const buttonId = event.target.id.split('_')[1];
        const numberOfGames =
            document
                .getElementById(`round_${buttonId}`)
                .querySelectorAll('select').length / 2;

        const nameInput = document.getElementById('name-input_' + buttonId);
        const games = [];

        for (let i = 0; i < numberOfGames; i++) {
            const currentGame = {
                stage: '',
                mode: '',
            };
            const id = buttonId + '_' + i;
            const stageSelector = document.getElementById(
                `stage-selector_${id}`
            );
            currentGame.stage = stageSelector.value;

            const modeSelector = document.getElementById(`mode-selector_${id}`);
            currentGame.mode = modeSelector.value;
            games.push(currentGame);
        }

		rounds.value[buttonId] = {
			meta: { name: nameInput.value },
			games: games,
		};
    };
    updateButton.classList.add('max-width');

    addChangeReminder(reminderCreatingElements, updateButton);

    // remove button
    const removeButton = document.createElement('button');
    removeButton.style.backgroundColor = 'var(--red)';
    removeButton.id = 'removeButton_' + id;
    removeButton.innerText = 'REMOVE';
    removeButton.classList.add('max-width');
    removeButton.onclick = (event) => {
        const buttonId = event.target.id.split('_')[1];
        if (activeRoundId.value === buttonId) {
            activeRoundId.value = Object.keys(rounds.value)[0];
        }

        if (rounds.value[buttonId]) {
            delete rounds.value[buttonId];
        } else {
            deleteRoundElem(buttonId);
        }
    };

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('layout');
    buttonContainer.classList.add('horizontal');

    buttonContainer.appendChild(updateButton);
    buttonContainer.appendChild(removeButton);

    roundElem.appendChild(buttonContainer);

    document.getElementById('round-grid').prepend(roundElem);
}

// function setRoundInputValues(id, values) {
//     const listNameItem = document.querySelector('input#name-input_' + id);
//     listNameItem.value = values[0].name;
//     for (let i = 1; i < values.length; i++) {
// 		let selectorId = id + '_';
// 		selectorId += i - 1;
//         const stageSelectElem = document.getElementById(
//             `stage-selector_${selectorId}`
//         );
//         const modeSelectElem = document.getElementById(
//             `mode-selector_${selectorId}`
//         );
//         stageSelectElem.value = values[i].stage;
//         modeSelectElem.value = values[i].mode;
//     }
// }

function fillList(selectElem, data) {
    for (let i = 0; i < data.length; i++) {
        const element = data[i];
        const option = document.createElement('option');
        option.value = element;
        option.text = element;
        selectElem.add(option);
    }
}

function updateRoundElem(id, data) {
    const nameInput = document.getElementById(`name-input_${id}`);
    nameInput.value = data.meta.name;

    const numberOfGames =
        document.getElementById(`round_${id}`).querySelectorAll('select')
            .length / 2;

    for (let i = 0; i < numberOfGames; i++) {
        const stageSelector = document.getElementById(`stage-selector_${id}_${i}`);
        const modeSelector = document.getElementById(`mode-selector_${id}_${i}`);

        stageSelector.value = data.games[i].stage;
        modeSelector.value = data.games[i].mode;
    }
}

function deleteRoundElem(id) {
    const roundSpace = document.getElementById(`round_${id}`);
    if (roundSpace) {
        roundSpace.parentNode.removeChild(roundSpace);
    }
}

function updateOrCreateCreateRoundElem(id, data) {
    const container = document.getElementById(`round_${id}`);
    if (container) {
        updateRoundElem(id, data);
    } else {
        createRoundElem(data.games.length, id, false);
        updateRoundElem(id, data);
    }
}

rounds.on('change', (newValue, oldValue) => {
    for (const id in newValue) {
        const object = newValue[id];
        updateOrCreateCreateRoundElem(id, object);
    }

    // Handle deletions
    if (oldValue) {
        for (const id in oldValue) {
            if (!newValue[id]) {
                deleteRoundElem(id);
            }
        }
    }
});

// importing rounds

const IMPORT_STATUS_SUCCESS = 0;
const IMPORT_STATUS_LOADING = 1;
const IMPORT_STATUS_FAILURE = 2;

document.getElementById('round-import-submit').onclick = () => {
    setImportStatus(IMPORT_STATUS_LOADING);
    const listsURL = document.getElementById('round-input-url-input').value;

    nodecg.sendMessage('getRounds', { url: listsURL }, e => {
        if (e) {
            console.error(e);
            setImportStatus(IMPORT_STATUS_FAILURE);
            return;
        }
        setImportStatus(IMPORT_STATUS_SUCCESS);
    });
};

function setImportStatus(status) {
    const statusElem = document.querySelector('.import-status');
    switch (status) {
        case IMPORT_STATUS_SUCCESS:
            statusElem.style.backgroundColor = 'var(--green)';
            return;
        case IMPORT_STATUS_LOADING:
            statusElem.style.backgroundColor = 'var(--yellow)';
            return;
        case IMPORT_STATUS_FAILURE:
            statusElem.style.backgroundColor = 'var(--red)';
    }
}
