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
    rounds.value = [
        [
            { id: '0', name: 'Default round' },
            { stage: 'Ancho-V Games', mode: 'Clam Blitz' },
            { stage: 'Ancho-V Games', mode: 'Tower Control' },
            { stage: 'Wahoo World', mode: 'Rainmaker' },
        ],
    ];
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

    const roundElem = document.createElement('div');
    roundElem.classList.add('space');
    roundElem.classList.add('round');
    roundElem.id = `round_${id}`;

    // name input
    const nameInput = document.createElement('input');
    const updateButton = document.createElement('button');
    nameInput.id = `name-input_${id}`;
    nameInput.addEventListener('input', () => {
        updateButton.style.backgroundColor = 'var(--red)';
    });
    nameInput.value = `Round ${id}`;
    nameInput.type = 'text';

    const nameInputLabel = document.createElement('div');
    nameInputLabel.innerText = 'Round name';
    nameInputLabel.classList.add('input-label');

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
        stageSelector.addEventListener('change', () => {
            updateButton.style.backgroundColor = 'var(--red)';
        });

        //mode select
        const modeSelect = document.createElement('select');
        modeSelect.id = `mode-selector_${id}_${i}`;
        modeSelect.classList.add('mode-select');
        fillList(modeSelect, splatModes);
        roundElem.appendChild(modeSelect);
        modeSelect.addEventListener('change', () => {
            updateButton.style.backgroundColor = 'var(--red)';
        });
    }

    // update button
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
        const selectedGames = [{ id: buttonId, name: nameInput.value }];
        for (let i = 0; i < numberOfGames; i++) {
            const currentGame = {
                stage: '',
                mode: '',
            };
            const id = buttonId + '_' + i;
            const stageSelector = document.getElementById(`stage-selector_${id}`);
            currentGame.stage = stageSelector.value;

            const modeSelector = document.getElementById(`mode-selector_${id}`);
            currentGame.mode = modeSelector.value;
            selectedGames.push(currentGame);
        }
        const roundIndex = findRound(buttonId);
        if (roundIndex == null) {
            rounds.value.push(selectedGames);
        } else {
            rounds.value[roundIndex] = selectedGames;
        }
        event.target.style.backgroundColor = 'var(--blue)';
    };
    updateButton.classList.add('max-width');

    // remove button
    const removeButton = document.createElement('button');
    removeButton.style.backgroundColor = 'var(--red)';
    removeButton.id = 'removeButton_' + id;
    removeButton.innerText = 'REMOVE';
    removeButton.classList.add('max-width');
    removeButton.onclick = (event) => {
        const buttonId = event.target.id.split('_')[1];
        if (activeRoundId.value == buttonId) {
            activeRoundId.value = rounds.value[0][0].id;
        }
        const roundSpace = document.querySelector('div#round_' + buttonId);
        const roundIndex = findRound(buttonId);
        if (roundIndex !== null) {
            rounds.value.splice(roundIndex, 1);
        }
        roundSpace.parentNode.removeChild(roundSpace);
    };

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('layout');
    buttonContainer.classList.add('horizontal');

    buttonContainer.appendChild(updateButton);
    buttonContainer.appendChild(removeButton);

    roundElem.appendChild(buttonContainer);

    document.getElementById('round-grid').prepend(roundElem);
}

function findRound(id) {
    for (let i = 0; i < rounds.value.length; i++) {
        const element = rounds.value[i];
        if (element[0].id == id) {
            return i;
        }
    }
    return null;
}

function setRoundInputValues(id, values) {
    const listNameItem = document.querySelector('input#name-input_' + id);
    listNameItem.value = values[0].name;
    for (let i = 1; i < values.length; i++) {
        var selectorId = id + '_';
        selectorId += i - 1;
        const stageSelectElem = document.getElementById(`stage-selector_${selectorId}`);
        const modeSelectElem = document.getElementById(`mode-selector_${selectorId}`);
        stageSelectElem.value = values[i].stage;
        modeSelectElem.value = values[i].mode;
    }
}

function fillList(selectElem, data) {
    for (let i = 0; i < data.length; i++) {
        const element = data[i];
        const option = document.createElement('option');
        option.value = element;
        option.text = element;
        selectElem.add(option);
    }
}

function roundElementExists(id) {
    const roundElement = document.getElementById(`round_${id}`);
    return roundElement !== null;
}

function checkIdExists(roundsList, id) {
    for (let i = 0; i < roundsList.length; i++) {
        if (roundsList[i][0].id === id) return true;
    }
    return false;
}

function removeRoundElem(id) {
    const roundSpace = document.getElementById(`round_${id}`);
    if (roundSpace) {
        roundSpace.parentNode.removeChild(roundSpace);
    }
}

rounds.on('change', (newValue, oldValue) => {
    for (let i = 0; i < newValue.length; i++) {
        const element = newValue[i];
        if (!roundElementExists(element[0].id)) {
            createRoundElem(element.length - 1, element[0].id, false);
        }
        setRoundInputValues(element[0].id, element);
    }
    if (oldValue) {
        // find rounds that are in the old value but not in the new value
        // then get rid of their corresponding elements

        const deletedLists = oldValue.filter(
            (x) => !checkIdExists(newValue, x[0].id)
        );
        if (deletedLists[0]) {
            for (let i = 0; i < deletedLists.length; i++) {
                removeRoundElem(deletedLists[i][0].id);
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

    nodecg.sendMessage('getRounds', { url: listsURL }, (e, result) => {
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
