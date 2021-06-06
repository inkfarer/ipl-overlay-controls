import { addChangeReminder, addDots, addSelector, clearSelectors, setToggleButtonDisabled } from '../globalScripts';
import '../globalStyles.css';
import './scoring.css';

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

const tournamentData = nodecg.Replicant('tournamentData');

tournamentData.on('change', (newValue) => {
    clearSelectors('team-selector');
    for (let i = 0; i < newValue.data.length; i++) {
        const element = newValue.data[i];
        addSelector(addDots(element.name), 'team-selector', element.id);
    }
});

// Fill out color selectors

const colors = [
    {
        meta: {
            name: 'Ranked Modes',
        },
        colors: [
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
        ],
    },
    {
        meta: {
            name: 'Turf War',
        },
        colors: [
            {
                index: 8,
                title: 'Yellow vs Purple',
                clrA: '#D1E004',
                clrB: '#960CB2',
            },
            {
                index: 9,
                title: 'Pink vs Blue',
                clrA: '#E61077',
                clrB: '#361CB8',
            },
            {
                index: 10,
                title: 'Pink vs Yellow',
                clrA: '#ED0C6A',
                clrB: '#D5E802',
            },
            {
                index: 11,
                title: 'Purple vs Turquoise',
                clrA: '#6B10CC',
                clrB: '#08CC81',
            },
            {
                index: 12,
                title: 'Pink vs Light Blue',
                clrA: '#E30960',
                clrB: '#02ADCF',
            },
            {
                index: 13,
                title: 'Purple vs Orange',
                clrA: '#5617C2',
                clrB: '#FF5F03',
            },
            {
                index: 14,
                title: 'Pink vs Green',
                clrA: '#E60572',
                clrB: '#1BBF0F',
            },
        ],
    },
    {
        meta: {
            name: 'Color Lock',
        },
        colors: [
            {
                index: 7,
                title: 'Yellow vs Blue (Color Lock)',
                clrA: '#FEF232',
                clrB: '#2F27CC',
            },
        ],
    },
    {
        meta: {
            name: 'Custom Color',
        },
        colors: [
            {
                index: 999,
                title: 'Custom Color',
                clrA: '#000000',
                clrB: '#FFFFFF',
            },
        ],
    },
];

for (let i = 0; i < colors.length; i++) {
    const element = colors[i];

    const optGroup = document.createElement('optgroup');
    optGroup.label = element.meta.name;

    for (let j = 0; j < element.colors.length; j++) {
        const color = element.colors[j];

        const option = document.createElement('option');
        option.value = color.index;
        option.text = color.title;
        option.dataset.firstColor = color.clrA;
        option.dataset.secondColor = color.clrB;
        // make custom color unselectable by user
        option.disabled = color.index === 999;

        optGroup.appendChild(option);
    }

    document.getElementById('color-selector').appendChild(optGroup);
}

// Scoreboard data

const scoreboardData = nodecg.Replicant('scoreboardData');
const scoreboardShown = nodecg.Replicant('scoreboardShown');

const customColorToggle = document.getElementById('custom-color-toggle');

scoreboardData.on('change', (newValue) => {
    document.getElementById('flavor-text-input').value = newValue.flavorText;

    document.getElementById('color-selector').value = newValue.colorInfo.index;

    updateColorDisplay(
        newValue.colorInfo,
        document.getElementById('team-a-color-display'),
        'a',
        newValue.swapColorOrder
    );
    updateColorDisplay(
        newValue.colorInfo,
        document.getElementById('team-b-color-display'),
        'b',
        newValue.swapColorOrder
    );
    updateColorDisplay(
        newValue.colorInfo,
        document.getElementById('team-a-custom-color'),
        'a',
        newValue.swapColorOrder
    );
    updateColorDisplay(
        newValue.colorInfo,
        document.getElementById('team-b-custom-color'),
        'b',
        newValue.swapColorOrder
    );

    const customColorEnabled = newValue.colorInfo.index === 999;
    customColorToggle.checked = customColorEnabled;
    updateCustomColorToggle(customColorEnabled);

    document.getElementById('team-a-selector').value = newValue.teamAInfo.id;
    document.getElementById('team-b-selector').value = newValue.teamBInfo.id;
});

function updateColorDisplay(colorInfo, elem, team, swapColors) {
    let color;

    if (team === 'a' && !swapColors) color = colorInfo.clrA;
    else if (team === 'a' && swapColors) color = colorInfo.clrB;
    else if (team === 'b' && !swapColors) color = colorInfo.clrB;
    else if (team === 'b' && swapColors) color = colorInfo.clrA;
    else color = '#000000';

    switch (elem.tagName.toLowerCase()) {
        case 'input':
            elem.value = color;
            break;
        default:
            elem.style.backgroundColor = color;
    }
}

scoreboardShown.on('change', (newValue) => {
    setToggleButtonDisabled(
        document.getElementById('show-scoreboard-btn'),
        document.getElementById('hide-scoreboard-btn'),
        newValue
    );
});

document.getElementById('update-scoreboard-btn').onclick = () => {
    let teamAInfo = tournamentData.value.data.filter(
        (team) => team.id === document.getElementById('team-a-selector').value
    )[0];
    let teamBInfo = tournamentData.value.data.filter(
        (team) => team.id === document.getElementById('team-b-selector').value
    )[0];

    const colorSelector = document.getElementById('color-selector');
    const colorOption = colorSelector.options[colorSelector.selectedIndex];

    let clrInfo;
    let swapColorOrder = scoreboardData.value.swapColorOrder;

    if (customColorToggle.checked) {
        clrInfo = {
            index: 999,
            name: 'Custom Color',
            clrA: document.getElementById('team-a-custom-color').value,
            clrB: document.getElementById('team-b-custom-color').value,
        };
        swapColorOrder = false;
    } else {
        clrInfo = {
            index: Number(colorOption.value),
            name: colorOption.text,
            clrA: colorOption.dataset.firstColor,
            clrB: colorOption.dataset.secondColor,
        };
    }

    scoreboardData.value = {
        flavorText: document.getElementById('flavor-text-input').value,
        colorInfo: clrInfo,
        swapColorOrder: swapColorOrder,
        teamAInfo: teamAInfo,
        teamBInfo: teamBInfo,
    };
};

document.getElementById('show-scoreboard-btn').onclick = () => {
    scoreboardShown.value = true;
};
document.getElementById('hide-scoreboard-btn').onclick = () => {
    scoreboardShown.value = false;
};

// Swap order of colors

document.getElementById('swap-color-order-btn').onclick = () => {
    scoreboardData.value.swapColorOrder = !scoreboardData.value.swapColorOrder;
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
    let teamAInfo = tournamentData.value.data.filter(
        (team) =>
            team.id === document.getElementById('next-team-a-selector').value
    )[0];
    let teamBInfo = tournamentData.value.data.filter(
        (team) =>
            team.id === document.getElementById('next-team-b-selector').value
    )[0];

    nextTeams.value.teamAInfo = teamAInfo;
    nextTeams.value.teamBInfo = teamBInfo;
};

document.getElementById('begin-next-match-btn').onclick = () => {
    scoreboardData.value.teamAInfo = nextTeams.value.teamAInfo;
    scoreboardData.value.teamBInfo = nextTeams.value.teamBInfo;

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

// custom color toggle

customColorToggle.onchange = (e) => {
    updateCustomColorToggle(e.target.checked);
};

function updateCustomColorToggle(checked) {
    const colorSelectContainer = document.getElementById(
        'color-select-container'
    );
    const customColorContainer = document.getElementById(
        'custom-color-select-container'
    );

    if (checked) {
        colorSelectContainer.style.display = 'none';
        customColorContainer.style.display = 'flex';
    } else {
        colorSelectContainer.style.display = 'unset';
        customColorContainer.style.display = 'none';
    }
}
