const mapWinners = nodecg.Replicant('mapWinners');
const activeMapListId = nodecg.Replicant('activeMapListId');
const teamScores = nodecg.Replicant('teamScores');

const maplists = nodecg.Replicant('maplists');

const mapListNameElem = document.getElementById('map-list-name');

NodeCG.waitForReplicants(mapWinners, teamScores, maplists).then(() => {
    activeMapListId.on('change', (newValue, oldValue) => {
        var currentMaplist = maplists.value.filter(
            (list) => list[0].id == newValue
        )[0];

        if (currentMaplist) {
            mapListNameElem.innerText = currentMaplist[0].name;
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
            mapListNameElem.innerText =
                'Undefined (Map list might have been deleted...)';
        }
    });
    teamScores.on('change', (newValue, oldValue) => {
        disableWinButtons(mapWinners.value);
    });
    mapWinners.on('change', (newValue) => {
        disableWinButtons(newValue);
    });
});

function addToggle(maplistElement, mapIndex) {
    const toggleDiv = document.createElement('div');
    toggleDiv.classList.add('toggles');
    const mapModeDisplay = document.createElement('div');

    mapModeDisplay.innerHTML = `
        <span class="center">${Number(mapIndex) + 1}</span>
        ${maplistElement.map}
        <br>
        ${maplistElement.mode}
    `;
    toggleDiv.appendChild(mapModeDisplay);

    const noWinButton = document.createElement('button');
    noWinButton.classList.add('no-win-toggle');
    noWinButton.classList.add('max-width');
    noWinButton.id = 'no-win-toggle_' + mapIndex;
    noWinButton.innerText = 'NO WIN';
    noWinButton.disabled = true;
    toggleDiv.appendChild(noWinButton);

    const AWinButton = document.createElement('button');
    AWinButton.classList.add('team-a-win-toggle');
    AWinButton.classList.add('green');
    AWinButton.classList.add('max-width');
    AWinButton.id = 'team-a-win-toggle_' + mapIndex;
    AWinButton.innerText = 'A WIN';

    const BWinButton = document.createElement('button');
    BWinButton.classList.add('team-b-win-toggle');
    BWinButton.classList.add('red');
    BWinButton.classList.add('max-width');
    BWinButton.id = 'team-b-win-toggle_' + mapIndex;
    BWinButton.innerText = 'B WIN';

    noWinButton.onclick = (event) => {
        const mapIndex = event.target.id.split('_')[1];
        mapWinners.value[mapIndex] = 0;
    };
    AWinButton.onclick = (event) => {
        const mapIndex = event.target.id.split('_')[1];
        mapWinners.value[mapIndex] = 1;
    };
    BWinButton.onclick = (event) => {
        const mapIndex = event.target.id.split('_')[1];
        mapWinners.value[mapIndex] = 2;
    };

    const winButtonContainer = document.createElement('div');
    winButtonContainer.classList.add('win-picker-container');
    winButtonContainer.appendChild(AWinButton);
    winButtonContainer.appendChild(BWinButton);
    toggleDiv.appendChild(winButtonContainer);

    //disableWinButtons(noWinButton, AWinButton, BWinButton, mapWinners.value[mapIndex]);

    document.getElementById('toggles').appendChild(toggleDiv);
}

document.getElementById('reset-btn').onclick = () => {
    mapWinners.value = [0, 0, 0, 0, 0, 0, 0];
};

function getButtons(id) {
    const noWinButton = document.querySelector('#no-win-toggle_' + id);
    const AWinButton = document.querySelector('#team-a-win-toggle_' + id);
    const BWinButton = document.querySelector('#team-b-win-toggle_' + id);
    return [noWinButton, AWinButton, BWinButton];
}

function disableWinButtons(mapWinnerValue) {
    var currentMaplist = maplists.value.filter(
        (list) => list[0].id == activeMapListId.value
    )[0];

    for (let i = 1; i < currentMaplist.length; i++) {
        const mapWinner = mapWinnerValue[i - 1];
        const buttons = getButtons(i - 1);
        for (let y = 0; y < buttons.length; y++) {
            buttons[y].disabled = false;
        }
        buttons[mapWinner].disabled = true;
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
