const maplists = nodecg.Replicant('maplists', {
    defaultValue: [
        [
            { id: 0, name: "Default map list" },
            { map: "Ancho-V Games", mode: "Clam Blitz" },
            { map: "Ancho-V Games", mode: "Tower Control" },
            { map: "Wahoo World", mode: "Rainmaker" }
        ]
    ]
});

const currentMaplistID = nodecg.Replicant('currentMaplistID', { defaultValue: 0 });

const splatMaps = ["Ancho-V Games",
    "Arowana Mall",
    "Blackbelly Skatepark",
    "Camp Triggerfish",
    "Goby Arena",
    "Humpback Pump Track",
    "Inkblot Art Academy",
    "Kelp Dome",
    "MakoMart",
    "Manta Maria",
    "Moray Towers",
    "Musselforge Fitness",
    "New Albacore Hotel",
    "Piranha Pit",
    "Port Mackerel",
    "Shellendorf Institute",
    "Shifty Station",
    "Snapper Canal",
    "Starfish Mainstage",
    "Sturgeon Shipyard",
    "The Reef",
    "Wahoo World",
    "Walleye Warehouse",
    "Skipper Pavilion",
    "Unknown Map"
];
splatMaps.sort();

const splatModes = ["Clam Blitz",
    "Tower Control",
    "Rainmaker",
    "Splat Zones",
    "Turf War",
    "Unknown Mode"
];
splatModes.sort();

const blue = "#3F51B5";
const red = "#C9513E";

//perhaps a little overcomplicated but it will do
function generateId() {
    return '' + Math.random().toString(36).substr(2, 9);
}

create3Map.onclick = () => {
    createMapList(3, generateId(), true);
}

create5Map.onclick = () => {
    createMapList(5, generateId(), true);
}

create7Map.onclick = () => {
    createMapList(7, generateId(), true);
}

removeAll.onclick = () => removeAllMaps();

function removeAllMaps() {
    var mapListElems = document.getElementsByClassName("mapListDiv");
    while (mapListElems[0]) {
        mapListElems[0].parentNode.removeChild(mapListElems[0]);
    }
    maplists.value = [
        [
            { id: 0, name: "Default map list" },
            { map: "Ancho-V Games", mode: "Clam Blitz" },
            { map: "Ancho-V Games", mode: "Tower Control" },
            { map: "Wahoo World", mode: "Rainmaker" }
        ]
	];
	currentMaplistID.value = 0;
}

function createMapList(numberOfMaps, id, remindToUpdate) {
    //support up to 7 maps for the time being
    //if you want me dead, host a tournament with 9 maps in the finals
    if (typeof numberOfMaps !== "number" || numberOfMaps >= 8 || numberOfMaps <= 0) {
        throw "this should not happen, ever";
	}
	
	// map list editor div
    var mapListDiv = document.createElement("div");
    mapListDiv.classList.add("space");
    mapListDiv.classList.add("mapListDiv");
	mapListDiv.id = "mapListSpace_" + id;
	
	// map list name input
    let nameInput = document.createElement("input");
    let updateButton = document.createElement("button");
    nameInput.id = "nameInput_" + id;
	nameInput.label = "Map list name";
	nameInput.addEventListener('input', () => {
        updateButton.style.backgroundColor = 'var(--red)';
	});
	nameInput.type = 'text';

	let nameInputLabel = document.createElement('div');
	nameInputLabel.innerText = 'Map list name';
	nameInputLabel.classList.add('inputLabel');

	mapListDiv.appendChild(nameInputLabel);
	mapListDiv.appendChild(nameInput);
	
    for (let i = 0; i < numberOfMaps; i++) {
        //separator
        let separator = document.createElement("div");
        separator.classList.add("separator");
        let separatorSpan = document.createElement("span");
        separatorSpan.innerText = i + 1;
        separator.appendChild(separatorSpan);
		mapListDiv.appendChild(separator);
		
        //map select
        let mapSelect = document.createElement("select");
        mapSelect.id = "mapSelect_" + id + "_" + i;
        mapSelect.classList.add("mapSelect");
        fillMapList(mapSelect);
		mapListDiv.appendChild(mapSelect);
		
        //mode select
        let modeSelect = document.createElement("select");
        modeSelect.id = "modeSelect_" + id + "_" + i;
        modeSelect.classList.add("modeSelect");
        fillModeList(modeSelect);
        mapListDiv.appendChild(modeSelect);
        mapSelect.addEventListener('change', () => {
            updateButton.style.backgroundColor = red;
        })
        modeSelect.addEventListener('change', () => {
            updateButton.style.backgroundColor = red;
        })
	}
	
	// update button
    updateButton.innerText = "update"
        //do i even have to do this?
    updateButton.id = numberOfMaps + "&" + id;
    if (remindToUpdate) {
        updateButton.style.backgroundColor = red;
    }
    updateButton.onclick = (event) => {
        let splitId = event.target.id.split("&");
        const buttonNumberOfMaps = splitId[0];
        const buttonId = splitId[1];
        let nameInput = document.querySelector("input#nameInput_" + buttonId);
        var selectedMaps = [{ id: buttonId, name: nameInput.value }];
        for (let i = 0; i < buttonNumberOfMaps; i++) {
            let currentMap = {
                map: "",
                mode: ""
            };
            let id = buttonId + "_" + i;
            let mapId = "select#mapSelect_" + id;
            let mapSelector = document.querySelector(mapId);
            currentMap.map = mapSelector.value;

            let modeId = "select#modeSelect_" + id;
            let modeSelector = document.querySelector(modeId);
            currentMap.mode = modeSelector.value;
            selectedMaps.push(currentMap);
        }
        const mapListIndex = findMapList(buttonId);
        if (mapListIndex == null) {
            maplists.value.push(selectedMaps);
        } else {
            maplists.value[mapListIndex] = selectedMaps;
        }
        event.target.style.backgroundColor = blue;
	}
	updateButton.classList.add('maxWidthButton');
	
	// remove button
    let removeButton = document.createElement("button");
    removeButton.style.backgroundColor = red;
    removeButton.id = "removeButton_" + id;
	removeButton.innerText = "REMOVE"
	removeButton.classList.add('maxWidthButton');
    removeButton.onclick = (event) => {
        const buttonId = event.target.id.split("_")[1];
        let mapListSpace = document.querySelector("div#mapListSpace_" + buttonId);
        let mapIndex = findMapList(buttonId);
        if (mapIndex !== null) {
            maplists.value.splice(mapIndex, 1);
        }
        mapListSpace.parentNode.removeChild(mapListSpace);
	}

	let buttonContainer = document.createElement('div');
	buttonContainer.classList.add('horizontalLayout');

	buttonContainer.appendChild(updateButton);
	buttonContainer.appendChild(removeButton);
	
	mapListDiv.appendChild(buttonContainer);

    mapsGrid.prepend(mapListDiv);
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
    let listNameItem = document.querySelector("input#nameInput_" + id);
    listNameItem.value = values[0].name;
    for (let i = 1; i < values.length; i++) {
        let selectorId = id + "_";
        selectorId += i - 1;
        let mapSelectElem = document.querySelector("select#mapSelect_" + selectorId);
        let modeSelectElem = document.querySelector("select#modeSelect_" + selectorId);
        mapSelectElem.value = values[i].map;
        modeSelectElem.value = values[i].mode;
    }
}

function fillMapList(mapList) {
    for (i = 0; i < splatMaps.length; i++) {
        var opt = document.createElement("option");
        opt.value = splatMaps[i];
        opt.text = splatMaps[i];
        mapList.add(opt);
    }
}

function fillModeList(modeList) {
    for (i = 0; i < splatModes.length; i++) {
        var opt = document.createElement("option");
        opt.value = splatModes[i];
        opt.text = splatModes[i];
        modeList.add(opt);
    }
}

function mapListElemExists(id) {
    const mapListElem = document.querySelector("div#mapListSpace_" + id);
    if (mapListElem === null) {
        return false;
    } else { return true; }
}

function checkIDExists(maplistsElem, id) {
    for (let i = 0; i < maplistsElem.length; i++) {
        if (maplistsElem[i][0].id === id) return true;
    }
    return false;
}

function removeMapListDiv(id) {
    let mapListSpace = document.getElementById('mapListSpace_' + id);
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

        let deletedLists = oldValue.filter(x => !checkIDExists(newValue, x[0].id));
        if (deletedLists[0]) {
            for (let i = 0; i < deletedLists.length; i++) {
                removeMapListDiv(deletedLists[i][0].id);
            }
        }
    }
});

function checkMapObjectEqual(obj1, obj2) {
    if (obj1.length !== obj2.length) { return false; }
    for (let i = 0; i < obj1.length; i++) {
        const element = obj1[i];
        const element2 = obj2[i];
        if (i === 0) {
            if (element.id != element2.id || element.name !== element2.name) { return false; }
        } else {
            if (element.map !== element2.map || element.mode !== element2.mode) { return false; }
        }
    }
    return true;
};

// importing map lists yehaw

const IMPORT_STATUS_SUCCESS = 0;
const IMPORT_STATUS_LOADING = 1;
const IMPORT_STATUS_FAILURE = 2;

submitFile.onclick = () => {
    setImportStatus(IMPORT_STATUS_LOADING);
    let listsURL = mapFileInput.value;
    fetch('https://cors-anywhere.herokuapp.com/' + listsURL)
        .then(response => {
            return response.json();
        })
        .then(data => {
            let maps = [];
            console.log(data);
            for (let a = 0; a < data.length; a++) {
                for (let i = 0; i < data[a].length; i++) {
                    for (let j = 0; j < data[a][i].length; j++) {
                        // do these maps or modes actually exist?
                        if (!splatMaps.includes(data[a][i][j].map)) {
                            data[a][i][j].map = 'Unknown Map';
                        }

                        if (!splatModes.includes(data[a][i][j].mode)) {
                            data[a][i][j].mode = 'Unknown Mode';
                        }
                    }

                    // prepend meta info (name, id)
                    data[a][i].unshift({id: generateId(), name: `Bracket ${a+1} Round ${i+1}`});
                }
                maps = maps.concat(data[a]);
            }

            maplists.value = maplists.value.concat(maps);

            setImportStatus(IMPORT_STATUS_SUCCESS);
        })
        .catch(err => {
            setImportStatus(IMPORT_STATUS_FAILURE);
            console.error(err);
        });
};

function setImportStatus(status) {
    let statusElem = document.querySelector('.importStatus');
    switch(status) {
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
