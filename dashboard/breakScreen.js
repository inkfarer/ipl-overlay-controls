// Main Scene

const mainFlavorText = nodecg.Replicant('mainFlavorText');
const flavorTextInput = document.getElementById('flavor-text-input');
const mainSceneUpdateBtn = document.getElementById('main-scene-update-btn');

mainFlavorText.on('change', (newValue) => {
    flavorTextInput.value = newValue;
});

mainSceneUpdateBtn.onclick = () => {
    mainFlavorText.value = flavorTextInput.value;
    updateStageTime();
};

// Show Timer

const NSTimerShown = nodecg.Replicant('NSTimerShown');

NSTimerShown.on('change', (newValue) => {
    document.getElementById('next-stage-timer-toggle').checked = newValue;
});

// Next Stage Timer

const nextStageTime = nodecg.Replicant('nextStageTime');
const minuteInput = document.getElementById('next-stage-minute-input');
const hourInput = document.getElementById('next-stage-hour-input');
const daySelect = document.getElementById('next-stage-day-select');

nextStageTime.on('change', (newValue) => {
    minuteInput.value = newValue.minute;
    hourInput.value = newValue.hour;
    daySelect.value = `${newValue.day}/${parseInt(newValue.month) + 1}`;
});

function updateDaySelector() {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayElem = getDayElem(today);
    daySelect.appendChild(todayElem);

    const tomorrowElem = getDayElem(tomorrow);
    daySelect.appendChild(tomorrowElem);
}

function getDayElem(date) {
    const dayElem = document.createElement('option');
    const dateText = `${date.getDate()}/${date.getMonth() + 1}`;
    dayElem.innerText = dateText;
    dayElem.value = dateText;
    dayElem.dataset.day = date.getDate();
    dayElem.dataset.month = date.getMonth();
    return dayElem;
}

function updateStageTime() {
    const min = parseInt(minuteInput.value);
    const hour = parseInt(hourInput.value);
    const selText = daySelect.options[daySelect.selectedIndex];
    if (selText) {
        const day = Number(selText.dataset.day);
        const month = Number(selText.dataset.month);

        if (min <= 59 && min >= 0 && hour <= 23 && hour >= 0) {
            nextStageTime.value = {
                hour: hour,
                minute: min,
                day: day,
                month: month,
            };
        }
    }
}

updateDaySelector();

addChangeReminder(
    document.querySelectorAll('.main-update-reminder'),
    mainSceneUpdateBtn
);

// Next Teams

const tourneyData = nodecg.Replicant('tourneyData');

tourneyData.on('change', (newValue) => {
    clearSelectors('team-selector');
    for (let i = 0; i < newValue.data.length; i++) {
        const element = newValue.data[i];
        addSelector(element.name, 'team-selector', element.id);
    }
});

const nextTeams = nodecg.Replicant('nextTeams');
const nextTeamASelector = document.getElementById('next-team-a-selector');
const nextTeamBSelector = document.getElementById('next-team-b-selector');
const nextTeamUpdateBtn = document.getElementById('update-next-teams-btn');

nextTeams.on('change', (newValue) => {
    nextTeamASelector.value = newValue.teamAInfo.id;
    nextTeamBSelector.value = newValue.teamBInfo.id;
});

nextTeamUpdateBtn.onclick = () => {
    let teamAInfo = tourneyData.value.data.filter(
        (team) => team.id === nextTeamASelector.value
    )[0];
    let teamBInfo = tourneyData.value.data.filter(
        (team) => team.id === nextTeamBSelector.value
    )[0];

    nextTeams.value.teamAInfo = teamAInfo;
    nextTeams.value.teamBInfo = teamBInfo;
};

addChangeReminder(
    document.querySelectorAll('.teams-update-reminder'),
    nextTeamUpdateBtn
);

// Maps

const maplists = nodecg.Replicant('maplists');
const currentMapsUpdateButton = document.getElementById(
    'current-map-list-update-btn'
);
const mapListSelector = document.getElementById('map-list-selector');
const currentMaplistID = nodecg.Replicant('currentMaplistID');

maplists.on('change', (newValue) => {
    clearSelectors('mapSelector');
    for (let i = 0; i < newValue.length; i++) {
        let opt = document.createElement('option');
        opt.value = newValue[i][0].id;
        opt.text = newValue[i][0].name;
        mapListSelector.appendChild(opt);
    }
});

NodeCG.waitForReplicants(maplists).then(() => {
    currentMaplistID.on('change', (newValue) => {
        mapListSelector.value = maplists.value.filter(
            (list) => list[0].id == newValue
        )[0][0].id;
    });
});

currentMapsUpdateButton.onclick = () => {
    currentMaplistID.value = mapListSelector.value;
};

addChangeReminder([mapListSelector], currentMapsUpdateButton);

// Current scene

const currentBreakScene = nodecg.Replicant('currentBreakScene');
const sceneSwitchButtons = {
    mainScene: document.getElementById('show-main-scene-btn'),
    nextUp: document.getElementById('show-teams-scene-btn'),
    maps: document.getElementById('show-stages-scene-btn'),
};

for (const [key, value] of Object.entries(sceneSwitchButtons)) {
    value.addEventListener('click', () => {
        currentBreakScene.value = key;
    });
}

currentBreakScene.on('change', (newValue) => {
    for (scene in sceneSwitchButtons) {
        sceneSwitchButtons[scene].disabled = false;
    }

    sceneSwitchButtons[newValue].disabled = true;
});

// Show team image

const teamImageHidden = nodecg.Replicant('teamImageHidden');
const teamAImageToggle = document.getElementById('team-a-image-toggle');
const teamBImageToggle = document.getElementById('team-b-image-toggle');

teamImageHidden.on('change', (newValue) => {
    teamAImageToggle.checked = newValue.teamA;
    teamBImageToggle.checked = newValue.teamB;
});

teamAImageToggle.onclick = (e) => {
    teamImageHidden.value.teamA = e.target.checked;
};

teamBImageToggle.onclick = (e) => {
    teamImageHidden.value.teamB = e.target.checked;
};
