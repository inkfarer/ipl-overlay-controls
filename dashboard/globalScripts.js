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

        var event;
        if (element.tagName.toLowerCase() == 'input') event = 'input';
        else if (element.tagName.toLowerCase() == 'select') event = 'change';
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
