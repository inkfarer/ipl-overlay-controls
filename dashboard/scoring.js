// Handle team score edits

const teamScores = nodecg.Replicant('teamScores');

teamScores.on('change', (newValue) => {
    teamAScoreInput.value = newValue.teamA;
    teamBScoreInput.value = newValue.teamB;
});

teamAPlus.onclick = () => {
    teamScores.value.teamA++;
};
teamAMinus.onclick = () => {
    teamScores.value.teamA--;
};
teamBPlus.onclick = () => {
    teamScores.value.teamB++;
};
teamBMinus.onclick = () => {
    teamScores.value.teamB--;
};

teamAScoreInput.oninput = (event) => {
    teamScores.value.teamA = event.target.value;
};
teamBScoreInput.oninput = (event) => {
    teamScores.value.teamB = event.target.value;
};

// Handle team data edits

const tourneyData = nodecg.Replicant('tourneyData');

tourneyData.on('change', (newValue) => {
    clearSelectors('teamSelector');
    for (let i = 0; i < newValue.data.length; i++) {
        const element = newValue.data[i];
        addSelector(element.name, 'teamSelector', element.id);
    }
});

// Fill out color selectors

const colors = [
    {
        index: 0,
        title: 'Green vs Grape',
        clrA: '#37FC00',
        clrB: '#7D28FC',
    },
    {
        index: 1,
        title: 'Green vs Magenta',
        clrA: '#04D976',
        clrB: '#D600AB',
    },
    {
        index: 2,
        title: 'Turquoise vs Orange',
        clrA: '#10E38F',
        clrB: '#FB7B08',
    },
    {
        index: 3,
        title: 'Mustard vs Purple',
        clrA: '#FF9E03',
        clrB: '#B909E0',
    },
    {
        index: 4,
        title: 'Dark Blue vs Green',
        clrA: '#2F27CC',
        clrB: '#37FC00',
    },
    {
        index: 5,
        title: 'Purple vs Green',
        clrA: '#B909E0',
        clrB: '#37FC00',
    },
    {
        index: 6,
        title: 'Yellow vs Blue',
        clrA: '#FEF232',
        clrB: '#2ED2FE',
    },
    {
        index: 7,
        title: 'Yellow vs Blue (Color Lock)',
        clrA: '#FEF232',
        clrB: '#2F27CC',
    },
];

for (let i = 0; i < colors.length; i++) {
    addSelector(colors[i].title, 'newColorSelector', colors[i].index);
}

// Scoreboard data

const SBData = nodecg.Replicant('SBData');

const SBShown = nodecg.Replicant('SBShown');

SBData.on('change', (newValue) => {
    flavorTextInput.value = newValue.flavorText;

    colorSelect.value = newValue.colorInfo.index;
    teamAColorDisplay.style.backgroundColor = newValue.swapColorOrder
        ? newValue.colorInfo.clrB
        : newValue.colorInfo.clrA;
    teamBColorDisplay.style.backgroundColor = newValue.swapColorOrder
        ? newValue.colorInfo.clrA
        : newValue.colorInfo.clrB;

    teamASelect.value = newValue.teamAInfo.id;
    teamBSelect.value = newValue.teamBInfo.id;
});

SBShown.on('change', (newValue) => {
    setToggleButtonDisabled(SBShow, SBHide, newValue);
});

SBUpdateBtn.onclick = () => {
    let teamAInfo = tourneyData.value.data.filter(
        (team) => team.id === teamASelect.value
    )[0];
    let teamBInfo = tourneyData.value.data.filter(
        (team) => team.id === teamBSelect.value
    )[0];
    let clrInfo = colors.filter(
        (clr) => clr.index === Number(colorSelect.value)
    )[0];

    let dataValue = {
        flavorText: flavorTextInput.value,
        colorInfo: clrInfo,
        swapColorOrder: SBData.value.swapColorOrder,
        teamAInfo: teamAInfo,
        teamBInfo: teamBInfo,
    };

    SBData.value = dataValue;
};

SBShow.onclick = () => {
    SBShown.value = true;
};
SBHide.onclick = () => {
    SBShown.value = false;
};

// Swap order of colors

clrOrderSwitch.onclick = () => {
    SBData.value.swapColorOrder = !SBData.value.swapColorOrder;
};

// Next Teams

const nextTeams = nodecg.Replicant('nextTeams');

nextTeams.on('change', (newValue) => {
    nextTeamASelect.value = newValue.teamAInfo.id;
    nextTeamBSelect.value = newValue.teamBInfo.id;
});

nextTeamUpdateBtn.onclick = () => {
    let teamAInfo = tourneyData.value.data.filter(
        (team) => team.id === nextTeamASelect.value
    )[0];
    let teamBInfo = tourneyData.value.data.filter(
        (team) => team.id === nextTeamBSelect.value
    )[0];

    nextTeams.value.teamAInfo = teamAInfo;
    nextTeams.value.teamBInfo = teamBInfo;
};

beginNextMatchBtn.onclick = () => {
    SBData.value.teamAInfo = nextTeams.value.teamAInfo;
    SBData.value.teamBInfo = nextTeams.value.teamBInfo;

    teamScores.value.teamA = 0;
    teamScores.value.teamB = 0;
};

// Add reminders to update info

addSelectChangeReminder(
    ['teamASelect', 'teamBSelect', 'colorSelect'],
    SBUpdateBtn
);
addInputChangeReminder(['flavorTextInput'], SBUpdateBtn);

addSelectChangeReminder(
    ['nextTeamASelect', 'nextTeamBSelect'],
    nextTeamUpdateBtn
);

// Show casters

showCasters.onclick = () => {
    nodecg.sendMessage('mainShowCasters');
};
