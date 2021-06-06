// For selectors

function clearSelectors(className) {
    const selectors = document.getElementsByClassName(className);
    for (let i = 0; i < selectors.length; i++) {
        const element = selectors[i];
        element.innerHTML = '';
    }
}

function addSelector(text, className, value = '') {
    const elements = document.querySelectorAll(`.${className}`);
    Array.from(elements).forEach(item => {
        const opt = document.createElement('option');
        opt.value = value === '' ? text : value;
        opt.text = text;
        item.appendChild(opt);
    });
}

// For toggling show/hide buttons

function setToggleButtonDisabled(toggleTrue, toggleFalse, state) {
    toggleTrue.disabled = state;
    toggleFalse.disabled = !state;
}

// Remind user to press 'update'

function addChangeReminder(elements, updateButton) {
    elements.forEach(element => {
        if (!element.tagName) return;

        let event;
        if (element.tagName.toLowerCase() === 'input') event = 'input';
        else if (element.tagName.toLowerCase() === 'select') event = 'change';
        else return;

        element.addEventListener(event, () => {
            updateButton.style.backgroundColor = 'var(--red)';
        });
    });

    updateButton.addEventListener('click', () => {
        updateButton.style.backgroundColor = 'var(--blue)';
    });
}

// For checkboxes to update replicants

function setReplicant(name, e) {
    nodecg.Replicant(name).value = e.target.checked;
}

function addDots(string) {
    const maxNameLength = 48;
    const rolloff = '...';

    if (!string) return string;
    if (string.length > maxNameLength) {
        return string.substring(0, maxNameLength - rolloff.length) + rolloff;
    }

    return string;
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
    'Unknown Stage'
];
splatStages.sort();

const splatModes = [
    'Clam Blitz',
    'Tower Control',
    'Rainmaker',
    'Splat Zones',
    'Turf War',
    'Unknown Mode'
];
splatModes.sort();

module.exports = {
    fillList,
    addSelector,
    clearSelectors,
    setToggleButtonDisabled,
    addChangeReminder,
    addDots,
    splatStages,
    splatModes
};

window.setReplicant = setReplicant;
