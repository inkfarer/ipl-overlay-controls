// For selectors

function clearSelectors(className) {
    let selectors = document.getElementsByClassName(className);
    for (let i = 0; i < selectors.length; i++) {
        const element = selectors[i];
        element.innerHTML = '';
    }
}

function addSelector(text, className, value = '') {
    var elements = document.querySelectorAll(`.${className}`);
    Array.from(elements).forEach(function (item) {
        var opt = document.createElement('option');
        opt.value = value !== '' ? value : text;
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
    elements.forEach((element) => {
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
    if (string.length > maxNameLength)
        return string.substring(0, maxNameLength - rolloff.length) + rolloff;
    else return string;
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
