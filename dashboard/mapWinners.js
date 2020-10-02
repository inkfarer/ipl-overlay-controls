const mapWinners = nodecg.Replicant('mapWinners', { defaultValue: [0, 0, 0, 0, 0, 0, 0] });
const currentMaplistID = nodecg.Replicant('currentMaplistID', { defaultValue: '0' });
const teamScores = nodecg.Replicant('teamScores', {defaultValue: {
    teamA: 0,
    teamB: 0
}});

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

NodeCG.waitForReplicants(mapWinners, teamScores, maplists).then(() => {
    currentMaplistID.on('change', (newValue, oldValue) => {
		var currentMaplist = maplists.value.filter(list => list[0].id == newValue)[0];

		if (currentMaplist) {
			maplistName.innerText = currentMaplist[0].name;
            removeToggles();
            for (let i = 1; i < currentMaplist.length; i++) {
                if (oldValue) {
                    mapWinners.value[i - 1] = 0;
                }

                const element = currentMaplist[i];
                addToggle(element, i - 1);
            }
		} else {
			removeToggles();
            maplistName.innerText = 'Undefined (Map list might have been deleted...)'
		}
    });
    teamScores.on('change', (newValue, oldValue) => {
        //const index = (newValue.teamA + newValue.teamB) - 1;
        disableWinButtons2(mapWinners.value);
    });
    mapWinners.on('change', newValue => {
        /*for (let i = 0; i < newValue.length; i++) {
            const element = newValue[i];
            const buttons = getButtons(i);
            if (buttons[0] != null) {
                disableWinButtons(buttons[0], buttons[1], buttons[2], element);
            }
        }*/
        disableWinButtons2(newValue);
    });
});

function addToggle(maplistElement, mapIndex) {
    const toggleDiv = document.createElement('div');
    toggleDiv.classList.add('toggleDiv');
    const mapModeDisplay = document.createElement('div');
    //i hate how this has to be a variable
    const mapIndexPlusOne = Number(mapIndex) + 1;
    mapModeDisplay.innerHTML = '<span class="center">' + mapIndexPlusOne + '</span>' + maplistElement.map + '<br>' + maplistElement.mode;
    toggleDiv.appendChild(mapModeDisplay);

    const noWinButton = document.createElement('button');
	noWinButton.classList.add('noWinButton');
	noWinButton.classList.add('btnBlue');
	noWinButton.classList.add('maxWidthButton');
    noWinButton.id = "noWin_" + mapIndex;
    noWinButton.innerText = "NO WIN";
    toggleDiv.appendChild(noWinButton);

    const AWinButton = document.createElement('button');
    AWinButton.classList.add('AWinButton');
	AWinButton.classList.add('btnGreen');
	AWinButton.classList.add('maxWidthButton');
    AWinButton.id = "AWin_" + mapIndex;
    AWinButton.innerText = "A WIN";

    const BWinButton = document.createElement('button');
    BWinButton.classList.add('BWinButton');
	BWinButton.classList.add('btnRed');
	BWinButton.classList.add('maxWidthButton');
    BWinButton.id = "BWin_" + mapIndex;
    BWinButton.innerText = "B WIN";

    noWinButton.onclick = (event) => {
        const mapIndex = event.target.id.split('_')[1];
        mapWinners.value[mapIndex] = 0;
        const buttons = getButtons(mapIndex);
        //disableWinButtons(buttons[0], buttons[1], buttons[2], 0);
    }
    AWinButton.onclick = (event) => {
        const mapIndex = event.target.id.split('_')[1];
        mapWinners.value[mapIndex] = 1;
        const buttons = getButtons(mapIndex);
        //disableWinButtons(buttons[0], buttons[1], buttons[2], 1);
    }
    BWinButton.onclick = (event) => {
        const mapIndex = event.target.id.split('_')[1];
        mapWinners.value[mapIndex] = 2;
        const buttons = getButtons(mapIndex);
        //disableWinButtons(buttons[0], buttons[1], buttons[2], 2);
    }

    const winButtonContainer = document.createElement('div');
    winButtonContainer.classList.add('wbContainer');
    winButtonContainer.appendChild(AWinButton);
    winButtonContainer.appendChild(BWinButton);
    toggleDiv.appendChild(winButtonContainer);

    //disableWinButtons(noWinButton, AWinButton, BWinButton, mapWinners.value[mapIndex]);

    document.getElementById('toggles').appendChild(toggleDiv);
}

document.getElementById('reset').onclick = () => {
    resetToggles();
}

function getButtons(id) {
    const noWinButton = document.querySelector('button#noWin_' + id);
    const AWinButton = document.querySelector('button#AWin_' + id);
    const BWinButton = document.querySelector('button#BWin_' + id);
    return [noWinButton, AWinButton, BWinButton];
}

/*function disableWinButtons(noWinButton, AWinButton, BWinButton, winner) {
    noWinButton.disabled = false;
    AWinButton.disabled = false;
    BWinButton.disabled = false;
    if (winner === 0) {
        noWinButton.disabled = true;
    } else if (winner === 1) {
        AWinButton.disabled = true;
    } else if (winner === 2) {
        BWinButton.disabled = true;
    }
}*/

function disableWinButtons2(mapWinnerValue) {
	const scoreSum = teamScores.value.teamA + teamScores.value.teamB;
	var currentMaplist = maplists.value.filter(list => list[0].id == currentMaplistID.value)[0];

    for (let i = 1; i < currentMaplist.length; i++) {
        const mapWinner = mapWinnerValue[i-1];
        const buttons = getButtons(i-1);
        for (let y = 0; y < buttons.length; y++) {
            buttons[y].disabled = false;
        }
        buttons[mapWinner].disabled = true;
        
    }
}

function resetToggles() {
    mapWinners.value = [0, 0, 0, 0, 0, 0, 0];
};

function removeToggles() {
    document.getElementById('toggles').innerHTML = "";
}

// set wins automatically check box

const autoWinSet = nodecg.Replicant('autoWinSet', {defaultValue: true});

autoWinSet.on('change', newValue => {
	checkAutoWinners.checked = newValue;
});