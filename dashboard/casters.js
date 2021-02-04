const casters = nodecg.Replicant('casters');

const btnCreateCaster = document.querySelector('#btnAddCaster');

casters.on('change', (newValue, oldValue) => {
	for (const id in newValue) {
		const object = newValue[id];
		updateOrCreateCreateCasterElem(id, object);
	}

	// Handle deletions
	if (oldValue) {
		for (const id in oldValue) {
			if (!newValue[id]) {
				deleteCasterElem(id);
			}
		}
	}

	if (Object.keys(newValue).length >= 3) {
		btnCreateCaster.disabled = true;
		setUncommittedButtonDisabled(true);
	} else {
		btnCreateCaster.disabled = false;
		setUncommittedButtonDisabled(false);
	}
});

btnCreateCaster.addEventListener('click', e => {
	createCasterElem(generateId());
	if (getCasterContainerCount() >= 3) e.target.disabled = true;
});

function setUncommittedButtonDisabled(disabled) {
	document.querySelectorAll('.uncommitted').forEach(elem => { elem.disabled = disabled; });
}

function generateId() {
    return '' + Math.random().toString(36).substr(2, 9);
}

function deleteCasterElem(id) {
	const container = document.querySelector(`#casterContainer_${id}`);
	container.parentNode.removeChild(container);
}

function updateOrCreateCreateCasterElem(id, data = {name: '', twitter: '', pronouns: ''}) {
	const container = document.querySelector(`#casterContainer_${id}`);
	if (container) {
		updateCasterElem(id, data);
	} else {
		createCasterElem(id, data, false);
	}
}

function updateCasterElem(id, data = {name: '', twitter: '', pronouns: ''}) {
	document.querySelector(`#casterName_${id}`).value = data.name
	document.querySelector(`#casterTwitter_${id}`).value = data.twitter
	document.querySelector(`#casterPronouns_${id}`).value = data.pronouns
}

function getCasterContainerCount() {
	return document.querySelectorAll('.casterContainer').length;
}

function createCasterElem(id, data = {name: '', twitter: '', pronouns: ''}, newElem = true) {
	if (newElem && getCasterContainerCount() >= 3) return;

	var container = document.createElement('div');
	container.classList.add('space');
	container.classList.add('casterContainer');
	container.id = `casterContainer_${id}`;

	var elem = `
	<div class="selectContainer">
		<div class="inputLabel">Name</div>
		<input type="text" id="casterName_${id}">
	</div>
	<div class="horizontalLayout">
		<div class="selectContainer casterTwitterInputContainer">
			<div class="inputLabel">Twitter</div>
			<input type="text" id="casterTwitter_${id}">
		</div>
		<div class="selectContainer">
			<div class="inputLabel">Pronouns</div>
			<input type="text" id="casterPronouns_${id}">
		</div>
	</div>
	<div class="horizontalLayout">
		<button class="btnBlue maxWidthButton ${newElem ? 'uncommitted' : ''}" id="updateCaster_${id}" style="background-color: ${newElem ? 'var(--red)' : 'var(--blue)'}">update</button>
		<button class="btnRed maxWidthButton" id="removeCaster_${id}">remove</button>
	</div>`
	container.innerHTML = elem;
	document.querySelector('#castersContainer').appendChild(container);
	
	// add data
	updateCasterElem(id, data);

	// remind to update
	addInputChangeReminder([`casterName_${id}`, `casterTwitter_${id}`, `casterPronouns_${id}`], document.querySelector(`#updateCaster_${id}`));

	// button click event
	document.querySelector(`#updateCaster_${id}`).addEventListener('click', e => {
		const id = e.target.id.split('_')[1];
		try {
			casters.value[id] = {
				name: document.querySelector(`#casterName_${id}`).value,
				twitter: document.querySelector(`#casterTwitter_${id}`).value,
				pronouns: document.querySelector(`#casterPronouns_${id}`).value
			};
		} catch (error) {
			console.error(error);
			return;
		}
		e.target.classList.remove('uncommitted');
	});
	document.querySelector(`#removeCaster_${id}`).addEventListener('click', e => {
		const id = e.target.id.split('_')[1];

		if (casters.value[id]) {
			delete casters.value[id];
		} else {
			deleteCasterElem(id);
		}
	});
}
