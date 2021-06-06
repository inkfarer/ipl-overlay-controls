import { addChangeReminder } from '../globalScripts';
import '../globalStyles.css';
import './casters.css';

const casters = nodecg.Replicant('casters');
const radiaSettings = nodecg.Replicant('radiaSettings');

const btnCreateCaster = document.getElementById('add-caster-btn');
const btnLoadFromVC = document.getElementById('load-casters-btn');

casters.on('change', (newValue, oldValue) => {
    for (const id in newValue) {
        const object = newValue[id];

        if (oldValue) {
            if (!casterObjectsMatch(object, oldValue[id])) {
                updateOrCreateCreateCasterElem(id, object);
            }
        } else {
            updateOrCreateCreateCasterElem(id, object);
        }
    }

    // Handle deletions
    if (oldValue) {
        for (const id in oldValue) {
            if (!newValue[id]) {
                deleteCasterElem(id);
            }
        }
    }

    setUncommittedButtonDisabled(Object.keys(newValue).length >= 3);
    disableCreateCasterButton();
});

btnCreateCaster.addEventListener('click', e => {
    createCasterElem(generateId());
    disableCreateCasterButton();
});

document.getElementById('copy-casters-btn').addEventListener('click', () => {
    let casterText = '';

    Object.keys(casters.value).forEach((item, index, arr) => {
        const element = casters.value[item];
        casterText += `${element.name} (${element.pronouns}, ${element.twitter})`;

        if (arr[index + 2]) casterText += ', ';
        else if (arr[index + 1]) casterText += ' & ';
    });

    navigator.clipboard.writeText(casterText).then(null, () => {
        console.error('Error copying to clipboard.');
    });
});

radiaSettings.on('change', newValue => {
    // If the api isn't enabled we disable the "load from vc" button
    btnLoadFromVC.disabled = !(newValue.enabled && newValue.guildID);
});

btnLoadFromVC.addEventListener('click', () => {
    nodecg.sendMessage('getLiveCommentators', {}, (e, result) => {
        if (e) {
            console.error(e);
            return;
        }

        if (result.extra && result.extra.length > 0) {
            for (let i = 0; i < result.extra.length; i++) {
                const extraCaster = result.extra[i];
                updateOrCreateCreateCasterElem(extraCaster.discord_user_id, extraCaster, true);
            }

            setUncommittedButtonDisabled(true);
        } else {
            setUncommittedButtonDisabled(false);
        }
    });
});

function casterObjectsMatch(val1, val2) {
    if (!val1 || !val2) return false;

    return !(val1.name !== val2.name || val1.twitter !== val2.twitter || val1.pronouns !== val2.pronouns);
}

function setUncommittedButtonDisabled(disabled) {
    document.querySelectorAll('.update-button.uncommitted').forEach(elem => {
        elem.disabled = disabled;
    });
}

function generateId() {
    return String(Math.random().toString(36).substr(2, 9));
}

function deleteCasterElem(id) {
    const container = document.getElementById(`caster-container_${id}`);
    container.parentNode.removeChild(container);
}

function updateOrCreateCreateCasterElem(id, data = { name: '', twitter: '', pronouns: '' }, isUncommitted = false) {
    const container = document.getElementById(`caster-container_${id}`);
    if (container) {
        updateCasterElem(id, data, !isUncommitted);
    } else {
        createCasterElem(id, data, isUncommitted);
    }
}

function updateCasterElem(id, data = { name: '', twitter: '', pronouns: '' }, resetColor = true) {
    document.getElementById(`caster-name-input_${id}`).value = data.name;
    document.getElementById(`caster-twitter-input_${id}`).value = data.twitter;
    document.getElementById(`caster-pronoun-input_${id}`).value = data.pronouns;
    if (resetColor) {
        document.getElementById(`update-caster_${id}`).style.backgroundColor = 'var(--blue)';
    }
}

function getCasterContainerCount() {
    return document.querySelectorAll('.caster-container').length;
}

function createCasterElem(id, data = { name: '', twitter: '', pronouns: '' }, isUncommitted = true) {
    const container = document.createElement('div');
    container.classList.add('space');
    container.classList.add('caster-container');
    container.id = `caster-container_${id}`;

    container.innerHTML = `
	<div class='select-container'>
		<label for='caster-name-input_${id}'>Name</label>
		<input type='text' id='caster-name-input_${id}'>
	</div>
	<div class='layout horizontal select-container'>
		<div class='select-container caster-twitter-input-container'>
			<label for='caster-twitter-input_${id}'>Twitter</label>
			<input type='text' id='caster-twitter-input_${id}'>
		</div>
		<div class='select-container'>
			<label for='caster-pronoun-input_${id}'>Pronouns</label>
			<input type='text' id='caster-pronoun-input_${id}'>
		</div>
	</div>
	<div class='layout horizontal'>
		<button
			class='update-button max-width${isUncommitted ? ' uncommitted' : ''}'
			id='update-caster_${id}'
			style='background-color: ${isUncommitted ? 'var(--red)' : 'var(--blue)'}'>
			update
		</button>
		<button class='red max-width' id='remove-caster_${id}'>remove</button>
	</div>`;
    document.getElementById('casters').prepend(container);

    // Add data
    updateCasterElem(id, data, !isUncommitted);

    // Remind to update
    addChangeReminder(
        [`caster-name-input_${id}`, `caster-twitter-input_${id}`, `caster-pronoun-input_${id}`].map(elem =>
            document.getElementById(elem)
        ),
        document.getElementById(`update-caster_${id}`)
    );

    // Button click event
    document.getElementById(`update-caster_${id}`).addEventListener('click', e => {
        const id = e.target.id.split('_')[1];
        try {
            casters.value[id] = {
                name: document.getElementById(`caster-name-input_${id}`).value,
                twitter: document.getElementById(`caster-twitter-input_${id}`).value,
                pronouns: document.getElementById(`caster-pronoun-input_${id}`).value
            };
        } catch (error) {
            console.error(error);
            return;
        }

        e.target.classList.remove('uncommitted');
    });
    document.getElementById(`remove-caster_${id}`).addEventListener('click', e => {
        const id = e.target.id.split('_')[1];

        if (casters.value[id]) {
            delete casters.value[id];
        } else {
            deleteCasterElem(id);
            disableCreateCasterButton();
        }
    });
}

function disableCreateCasterButton() {
    btnCreateCaster.disabled = getCasterContainerCount() >= 3;
}
