const casters = nodecg.Replicant('casters');

casters.on('change', (newValue, oldValue) => {
	document.querySelector('#castersContainer').innerHTML = '';
	for (let i = 0; i < newValue.length; i++) {
		const element = newValue[i];
		createCasterElem(element.id, element, false);
	}
});

function generateId() {
    return '' + Math.random().toString(36).substr(2, 9);
}

document.querySelector('#btnAddCaster').addEventListener('click', () => {
	createCasterElem(generateId());
});

function createCasterElem(id, data = {name: '', twitter: '', pronouns: ''}, newElem = true) {
	var container = document.createElement('div');
	container.classList.add('space');
	container.id = `casterContainer_${id}`;

	var elem = `<div class="selectContainer">
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
			<input type="text" id="casterPronoun_${id}">
		</div>
	</div>
	<div class="horizontalLayout">
		<button class="btnBlue maxWidthButton" id="updateCaster_${id}" style="background-color: ${newElem ? 'var(--red)' : 'var(--blue)'}">update</button>
		<button class="btnRed maxWidthButton" id="removeCaster_${id}">remove</button>
	</div>`
	container.innerHTML = elem;
	document.querySelector('#castersContainer').appendChild(container);
	
	// add data
	document.querySelector(`#casterName_${id}`).value = data.name;
	document.querySelector(`#casterTwitter_${id}`).value = data.twitter;
	document.querySelector(`#casterPronoun_${id}`).value = data.pronouns;

	// remind to update
	addInputChangeReminder([`casterName_${id}`, `casterTwitter_${id}`, `casterPronoun_${id}`], document.querySelector(`#updateCaster_${id}`));

	// button click event
	document.querySelector(`#updateCaster_${id}`).addEventListener('click', e => {
		var id = e.target.id.split('_')[1];
		var index = getCasterIndex(id);

		var newData = {
			id: id,
			name: document.querySelector(`#casterName_${id}`).value,
			twitter: document.querySelector(`#casterTwitter_${id}`).value,
			pronouns: document.querySelector(`#casterPronoun_${id}`).value
		}

		if (index !== null) {
			casters.value[index] = newData;
		} else {
			casters.value.push(newData);
		}
	});
	document.querySelector(`#removeCaster_${id}`).addEventListener('click', e => {
		var id = e.target.id.split('_')[1];
		var index = getCasterIndex(id);
		if (index) {
			casters.value.splice(index, 1);
		} else {
			// if value is unsaved to replicant
			let container = document.querySelector(`#casterContainer_${id}`);
			container.parentNode.removeChild(container);
		}
	});
}

function getCasterIndex(id) {
	for (let i = 0; i < casters.value.length; i++) {
		const element = casters.value[i];
		if (element.id == id) {
			return i;
		}
	}
	return null;
}