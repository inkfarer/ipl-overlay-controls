// Main Scene

const mainFlavorText = nodecg.Replicant('mainFlavorText');
const casterNames = nodecg.Replicant('casterNames');

mainFlavorText.on('change', newValue => { breakFlavorInput.value = newValue; });
casterNames.on('change', newValue => { casterInput.value = newValue; });

updateMainScene.onclick = () => {
    mainFlavorText.value = breakFlavorInput.value;
    casterNames.value = casterInput.value;
    updateStageTime();
};

// Show Timer

const NSTimerShown = nodecg.Replicant('NSTimerShown');

NSTimerShown.on('change', newValue => {
    document.querySelector('#checkShowTimer').checked = newValue;
});

// Next Stage Timer

const nextStageTime = nodecg.Replicant('nextStageTime');

nextStageTime.on('change', newValue => {
    document.querySelector('.minInput').value = newValue.minute;
	document.querySelector('.hourInput').value = newValue.hour;
	document.querySelector('.daySelect').value = `${newValue.day}/${parseInt(newValue.month) + 1}`;
});

function updateDaySelector() {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const daySelect = document.querySelector('.daySelect');

    const todayElem = getDayElem(today);
    daySelect.appendChild(todayElem);

    const tomorElem = getDayElem(tomorrow);
    daySelect.appendChild(tomorElem);
}

function getDayElem(date) {
    const dayElem = document.createElement('option');
    dayElem.innerText = `${date.getDate()}/${date.getMonth() + 1}`;
    dayElem.dataset.day = date.getDate();
    dayElem.dataset.month = date.getMonth();
    return dayElem;
}

function updateStageTime() {
    const min = parseInt(document.querySelector('.minInput').value);
    const hour = parseInt(document.querySelector('.hourInput').value);
    const daySelect = document.querySelector('.daySelect');
    const selText = daySelect.options[daySelect.selectedIndex];
    if (selText) {
        const day = Number(selText.dataset.day);
        const month = Number(selText.dataset.month);

        if (min <= 59 && min >= 0 && hour <= 23 && hour >= 0) {
            nextStageTime.value = {
                hour: hour,
                minute: min,
                day: day,
                month: month
            };
        }
    }
}

updateDaySelector();

addSelectChangeReminder(['daySelect'], updateMainScene);
addInputChangeReminder(['breakFlavorInput', 'casterInput', 'hourInput', 'minInput'], updateMainScene);

// Next Teams

const tourneyData = nodecg.Replicant('tourneyData');

tourneyData.on('change', newValue => {
	clearSelectors('teamSelector');
    for (let i = 0; i < newValue.data.length; i++) {
        const element = newValue.data[i];
        addSelector(element.name, 'teamSelector', element.id);
    }
});

const nextTeams = nodecg.Replicant('nextTeams');

nextTeams.on('change', newValue => {
	nextTeamASelect.value = newValue.teamAInfo.id;
	nextTeamBSelect.value = newValue.teamBInfo.id;
});

nextTeamUpdateBtn.onclick = () => {
	let teamAInfo = tourneyData.value.data.filter(team => team.id === nextTeamASelect.value)[0];
	let teamBInfo = tourneyData.value.data.filter(team => team.id === nextTeamBSelect.value)[0];

	nextTeams.value.teamAInfo = teamAInfo;
	nextTeams.value.teamBInfo = teamBInfo;
};

addSelectChangeReminder(['nextTeamASelect', 'nextTeamBSelect'], nextTeamUpdateBtn);

// Maps

const maplists = nodecg.Replicant('maplists');

const currentMaplistID = nodecg.Replicant('currentMaplistID');

maplists.on('change', newValue => {
	clearSelectors('mapSelector');
	for (let i = 0; i < newValue.length; i++) {
		let opt = document.createElement("option");
        opt.value = newValue[i][0].id;
        opt.text = newValue[i][0].name;
        mapListSelect.appendChild(opt);
	}
});

currentMaplistID.on('change', newValue => {
	let maplistID = maplists.value.filter(list => list[0].id == newValue)[0][0].id;
	mapListSelect.value = maplistID;
});

updateMaps.onclick = () => {
	currentMaplistID.value = mapListSelect.value;
};

addSelectChangeReminder(['mapListSelect'], updateMaps);

// Current scene

const currentBreakScene = nodecg.Replicant('currentBreakScene');

showMain.onclick = () => { currentBreakScene.value = "mainScene"; }
showNextUp.onclick = () => { currentBreakScene.value = "nextUp"; }
showMaps.onclick = () => { currentBreakScene.value = "maps"; }

currentBreakScene.on('change', newValue => {
    disableSceneButtons(newValue);
});

function disableSceneButtons(currentScene) {
    const elements = ["showMain", "showNextUp", "showMaps"];
    elements.forEach(element => { document.getElementById(element).disabled = false; });
    if (currentScene === "mainScene") {
        showMain.disabled = true;
    } else if (currentScene === "nextUp") {
        showNextUp.disabled = true;
    } else if (currentScene === "maps") {
        showMaps.disabled = true;
    }
}

// Show team image

const teamImageHidden = nodecg.Replicant('teamImageHidden');

teamImageHidden.on('change', newValue => {
    checkSetTeamAImg.checked = newValue.teamA;
    checkSetTeamBImg.checked = newValue.teamB;
});

checkSetTeamAImg.onclick = e => {
    teamImageHidden.value.teamA = e.target.checked;
};

checkSetTeamBImg.onclick = e => {
    teamImageHidden.value.teamB = e.target.checked;
};
