// For selectors

function clearSelectors(className) {
    let selectors = document.getElementsByClassName(className);
    for (let i = 0; i < selectors.length; i++) {
        const element = selectors[i];
        element.innerHTML = "";
    }
}

function addSelector(text, className, value = '') {
    var elements = document.querySelectorAll(`.${className}`);
    Array.from(elements).forEach(function(item) {
        var opt = document.createElement("option");
        opt.value = (value !== '') ? value : text;
        opt.text = text;
        item.appendChild(opt);
    });
}

// For toggling show/hide buttons

function setToggleButtonDisabled(toggleTrue, toggleFalse, state) {
	toggleTrue.disabled = true;
	toggleFalse.disabled = true;

	if (state) { toggleFalse.disabled = false; }
	else { toggleTrue.disabled = false; }
}

// Remind user to press 'update'

function addSelectChangeReminder(elements, updateButton) {
	elements.forEach(element => document.getElementById(element).addEventListener('change', () => { updateButton.style.backgroundColor = 'var(--red)'; }));
	updateButton.addEventListener('click', () => {updateButton.style.backgroundColor = 'var(--blue)'; });
}

function addInputChangeReminder(elements, updateButton) {
	elements.forEach(element => document.getElementById(element).addEventListener('input', () => { updateButton.style.backgroundColor = 'var(--red)'; }));
	updateButton.addEventListener('click', () => {updateButton.style.backgroundColor = 'var(--blue)'; });
}

// For checkboxes to update replicants

function setReplicant(name, e) {
    nodecg.Replicant(name).value = e.target.checked;
};