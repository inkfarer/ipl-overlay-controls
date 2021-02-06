const maplists = nodecg.Replicant('maplists');

const activeMapListId = nodecg.Replicant('activeMapListId');

const splatMaps = [
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
    'Unknown Map',
];
splatMaps.sort();

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

document.getElementById('create-3-map').onclick = () => {
    createMapList(3, generateId(), true);
};

document.getElementById('create-5-map').onclick = () => {
    createMapList(5, generateId(), true);
};

document.getElementById('create-7-map').onclick = () => {
    createMapList(7, generateId(), true);
};

document.getElementById('reset-maps').onclick = () => resetMaps();

function resetMaps() {
    maplists.value = [
        [
            { id: '0', name: 'Default map list' },
            { map: 'Ancho-V Games', mode: 'Clam Blitz' },
            { map: 'Ancho-V Games', mode: 'Tower Control' },
            { map: 'Wahoo World', mode: 'Rainmaker' },
        ],
    ];
    activeMapListId.value = '0';
}

function createMapList(numberOfMaps, id, remindToUpdate) {
    //support up to 7 maps for the time being
    //if you want me dead, host a tournament with 9 maps in the finals
    if (
        typeof numberOfMaps !== 'number' ||
        numberOfMaps >= 8 ||
        numberOfMaps <= 0
    ) {
        throw 'Map lists with only up to 7 maps are supported.';
    }

    // map list editor div
    const mapListElem = document.createElement('div');
    mapListElem.classList.add('space');
    mapListElem.classList.add('map-list');
    mapListElem.id = `map-list_${id}`;

    // map list name input
    const nameInput = document.createElement('input');
    const updateButton = document.createElement('button');
    nameInput.id = `name-input_${id}`;
    nameInput.label = 'Map list name';
    nameInput.addEventListener('input', () => {
        updateButton.style.backgroundColor = 'var(--red)';
    });
    nameInput.value = `Map list ${id}`;
    nameInput.type = 'text';

    const nameInputLabel = document.createElement('div');
    nameInputLabel.innerText = 'Map list name';
    nameInputLabel.classList.add('input-label');

    mapListElem.appendChild(nameInputLabel);
    mapListElem.appendChild(nameInput);

    for (let i = 0; i < numberOfMaps; i++) {
        //separator
        const separator = document.createElement('div');
        separator.classList.add('separator');
        const separatorSpan = document.createElement('span');
        separatorSpan.innerText = i + 1;
        separator.appendChild(separatorSpan);
        mapListElem.appendChild(separator);

        //map select
        const mapSelect = document.createElement('select');
        mapSelect.id = `map-select_${id}_${i}`;
        mapSelect.classList.add('map-select');
        fillList(mapSelect, splatMaps);
        mapListElem.appendChild(mapSelect);
        mapSelect.addEventListener('change', () => {
            updateButton.style.backgroundColor = 'var(--red)';
        });

        //mode select
        const modeSelect = document.createElement('select');
        modeSelect.id = `mode-select_${id}_${i}`;
        modeSelect.classList.add('mode-select');
        fillList(modeSelect, splatModes);
        mapListElem.appendChild(modeSelect);
        modeSelect.addEventListener('change', () => {
            updateButton.style.backgroundColor = 'var(--red)';
        });
    }

    // update button
    updateButton.innerText = 'update';
    updateButton.id = `update-maps_${id}`;
    if (remindToUpdate) {
        updateButton.style.backgroundColor = 'var(--red)';
    }
    updateButton.onclick = (event) => {
        const buttonId = event.target.id.split('_')[1];
        const numberOfMaps =
            document
                .getElementById(`map-list_${buttonId}`)
                .querySelectorAll('select').length / 2;
        const nameInput = document.getElementById('name-input_' + buttonId);
        const selectedMaps = [{ id: buttonId, name: nameInput.value }];
        for (let i = 0; i < numberOfMaps; i++) {
            const currentMap = {
                map: '',
                mode: '',
            };
            const id = buttonId + '_' + i;
            const mapId = 'select#map-select_' + id;
            const mapSelector = document.querySelector(mapId);
            currentMap.map = mapSelector.value;

            const modeId = 'select#mode-select_' + id;
            const modeSelector = document.querySelector(modeId);
            currentMap.mode = modeSelector.value;
            selectedMaps.push(currentMap);
        }
        const mapListIndex = findMapList(buttonId);
        if (mapListIndex == null) {
            maplists.value.push(selectedMaps);
        } else {
            maplists.value[mapListIndex] = selectedMaps;
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
        const mapListSpace = document.querySelector('div#map-list_' + buttonId);
        const mapIndex = findMapList(buttonId);
        if (mapIndex !== null) {
            maplists.value.splice(mapIndex, 1);
        }
        mapListSpace.parentNode.removeChild(mapListSpace);
    };

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('layout');
    buttonContainer.classList.add('horizontal');

    buttonContainer.appendChild(updateButton);
    buttonContainer.appendChild(removeButton);

    mapListElem.appendChild(buttonContainer);

    document.getElementById('map-grid').prepend(mapListElem);
}

function findMapList(id) {
    for (let i = 0; i < maplists.value.length; i++) {
        const element = maplists.value[i];
        if (element[0].id == id) {
            return i;
        }
    }
    return null;
}

function setMapListValues(id, values) {
    const listNameItem = document.querySelector('input#name-input_' + id);
    listNameItem.value = values[0].name;
    for (let i = 1; i < values.length; i++) {
        var selectorId = id + '_';
        selectorId += i - 1;
        const mapSelectElem = document.querySelector(
            'select#map-select_' + selectorId
        );
        const modeSelectElem = document.querySelector(
            'select#mode-select_' + selectorId
        );
        mapSelectElem.value = values[i].map;
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

function mapListElemExists(id) {
    const mapListElem = document.getElementById(`map-list_${id}`);
    if (mapListElem === null) {
        return false;
    } else {
        return true;
    }
}

function checkIDExists(maplistsElem, id) {
    for (let i = 0; i < maplistsElem.length; i++) {
        if (maplistsElem[i][0].id === id) return true;
    }
    return false;
}

function removeMapListElem(id) {
    const mapListSpace = document.getElementById(`map-list_${id}`);
    if (mapListSpace) {
        mapListSpace.parentNode.removeChild(mapListSpace);
    }
}

maplists.on('change', (newValue, oldValue) => {
    for (let i = 0; i < newValue.length; i++) {
        const element = newValue[i];
        if (!mapListElemExists(element[0].id)) {
            createMapList(element.length - 1, element[0].id, false);
        }
        setMapListValues(element[0].id, element);
    }
    if (oldValue) {
        // find map lists that are in the old value but not in the new value
        // then get rid of their corresponding elements

        const deletedLists = oldValue.filter(
            (x) => !checkIDExists(newValue, x[0].id)
        );
        if (deletedLists[0]) {
            for (let i = 0; i < deletedLists.length; i++) {
                removeMapListElem(deletedLists[i][0].id);
            }
        }
    }
});

function checkMapObjectEqual(obj1, obj2) {
    if (obj1.length !== obj2.length) {
        return false;
    }
    for (let i = 0; i < obj1.length; i++) {
        const element = obj1[i];
        const element2 = obj2[i];
        if (i === 0) {
            if (element.id != element2.id || element.name !== element2.name) {
                return false;
            }
        } else {
            if (
                element.map !== element2.map ||
                element.mode !== element2.mode
            ) {
                return false;
            }
        }
    }
    return true;
}

// importing map lists yehaw

const IMPORT_STATUS_SUCCESS = 0;
const IMPORT_STATUS_LOADING = 1;
const IMPORT_STATUS_FAILURE = 2;

document.getElementById('map-import-submit').onclick = () => {
    setImportStatus(IMPORT_STATUS_LOADING);
    const listsURL = mapFileInput.value;

    nodecg.sendMessage('getMapList', { url: listsURL }, (e, result) => {
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
