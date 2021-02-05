// Handle team score edits

const teamScores = nodecg.Replicant('teamScores');

teamScores.on('change', (newValue) => {
    document.getElementById('team-a-score-input').value = newValue.teamA;
    document.getElementById('team-b-score-input').value = newValue.teamB;
});

document.getElementById('team-a-score-plus-btn').onclick = () => {
    teamScores.value.teamA++;
};
document.getElementById('team-a-score-minus-btn').onclick = () => {
    teamScores.value.teamA--;
};
document.getElementById('team-b-score-plus-btn').onclick = () => {
    teamScores.value.teamB++;
};
document.getElementById('team-b-score-minus-btn').onclick = () => {
    teamScores.value.teamB--;
};

document.getElementById('team-a-score-input').oninput = (event) => {
    teamScores.value.teamA = Number(event.target.value);
};
document.getElementById('team-b-score-input').oninput = (event) => {
    teamScores.value.teamB = Number(event.target.value);
};

// Handle team data edits

const tourneyData = nodecg.Replicant('tourneyData');

tourneyData.on('change', (newValue) => {
    clearSelectors('team-selector');
    for (let i = 0; i < newValue.data.length; i++) {
        const element = newValue.data[i];
        addSelector(element.name, 'team-selector', element.id);
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
    addSelector(colors[i].title, 'color-selector', colors[i].index);
}

// Scoreboard data

const SBData = nodecg.Replicant('SBData');

const SBShown = nodecg.Replicant('SBShown');

SBData.on('change', (newValue) => {
    document.getElementById('flavor-text-input').value = newValue.flavorText;

    document.getElementById('color-selector').value = newValue.colorInfo.index;
    document.getElementById(
        'team-a-color-display'
    ).style.backgroundColor = newValue.swapColorOrder
        ? newValue.colorInfo.clrB
        : newValue.colorInfo.clrA;
    document.getElementById(
        'team-b-color-display'
    ).style.backgroundColor = newValue.swapColorOrder
        ? newValue.colorInfo.clrA
        : newValue.colorInfo.clrB;

    document.getElementById('team-a-selector').value = newValue.teamAInfo.id;
    document.getElementById('team-b-selector').value = newValue.teamBInfo.id;
});

SBShown.on('change', (newValue) => {
    setToggleButtonDisabled(
        document.getElementById('show-scoreboard-btn'),
        document.getElementById('hide-scoreboard-btn'),
        newValue
    );
});

document.getElementById('update-scoreboard-btn').onclick = () => {
    let teamAInfo = tourneyData.value.data.filter(
        (team) => team.id === document.getElementById('team-a-selector').value
    )[0];
    let teamBInfo = tourneyData.value.data.filter(
        (team) => team.id === document.getElementById('team-b-selector').value
    )[0];
    let clrInfo = colors.filter(
        (clr) =>
            clr.index ===
            Number(document.getElementById('color-selector').value)
    )[0];

    let dataValue = {
        flavorText: document.getElementById('flavor-text-input').value,
        colorInfo: clrInfo,
        swapColorOrder: SBData.value.swapColorOrder,
        teamAInfo: teamAInfo,
        teamBInfo: teamBInfo,
    };

    SBData.value = dataValue;
};

document.getElementById('show-scoreboard-btn').onclick = () => {
    SBShown.value = true;
};
document.getElementById('hide-scoreboard-btn').onclick = () => {
    SBShown.value = false;
};

// Swap order of colors

document.getElementById('swap-color-order-btn').onclick = () => {
    SBData.value.swapColorOrder = !SBData.value.swapColorOrder;
};

// Next Teams

const nextTeams = nodecg.Replicant('nextTeams');

nextTeams.on('change', (newValue) => {
    document.getElementById('next-team-a-selector').value =
        newValue.teamAInfo.id;
    document.getElementById('next-team-b-selector').value =
        newValue.teamBInfo.id;
});

document.getElementById('update-next-teams-btn').onclick = () => {
    let teamAInfo = tourneyData.value.data.filter(
        (team) =>
            team.id === document.getElementById('next-team-a-selector').value
    )[0];
    let teamBInfo = tourneyData.value.data.filter(
        (team) =>
            team.id === document.getElementById('next-team-b-selector').value
    )[0];

    nextTeams.value.teamAInfo = teamAInfo;
    nextTeams.value.teamBInfo = teamBInfo;
};

document.getElementById('begin-next-match-btn').onclick = () => {
    SBData.value.teamAInfo = nextTeams.value.teamAInfo;
    SBData.value.teamBInfo = nextTeams.value.teamBInfo;

    teamScores.value = {
        teamA: 0,
        teamB: 0,
    };
};

// Add reminders to update info

addChangeReminder(
    document.querySelectorAll('.scoreboard-update-warning'),
    document.getElementById('update-scoreboard-btn')
);

addChangeReminder(
    document.querySelectorAll('.next-team-update-warning'),
    document.getElementById('update-next-teams-btn')
);

// Show casters

document.getElementById('show-casters-btn').onclick = () => {
    nodecg.sendMessage('mainShowCasters');
};
