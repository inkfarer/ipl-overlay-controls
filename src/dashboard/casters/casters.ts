import { Caster } from 'schemas';
import { generateId } from '../../helpers/generateId';
import { addChangeReminder } from '../helpers/buttonHelper';
import { casters } from './replicants';

const btnCreateCaster = document.getElementById('add-caster-btn') as HTMLButtonElement;

casters.on('change', (newValue, oldValue) => {
    for (const id in newValue) {
        if (!Object.prototype.hasOwnProperty.call(newValue, id)) continue;

        const object: Caster = newValue[id];

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
            if (!Object.prototype.hasOwnProperty.call(oldValue, id)) continue;

            if (!newValue[id]) {
                deleteCasterElem(id);
            }
        }
    }

    setUncommittedButtonDisabled(Object.keys(newValue).length >= 3);
    disableCreateCasterButton();
});

btnCreateCaster.addEventListener('click', () => {
    createCasterElem(generateId());
    disableCreateCasterButton();
});

export function updateOrCreateCreateCasterElem(id: string, data: Caster, isUncommitted = false): void {
    const container = document.getElementById(`caster-container_${id}`);
    if (container) {
        updateCasterElem(id, data, !isUncommitted);
    } else {
        createCasterElem(id, data, isUncommitted);
    }
}

function updateCasterElem(id: string, data: Caster, resetColor = true) {
    (document.getElementById(`caster-name-input_${id}`) as HTMLInputElement).value = data.name || '';
    (document.getElementById(`caster-twitter-input_${id}`) as HTMLInputElement).value = data.twitter || '';
    (document.getElementById(`caster-pronoun-input_${id}`) as HTMLInputElement).value = data.pronouns || '';
    if (resetColor) {
        document.getElementById(`update-caster_${id}`).style.backgroundColor = 'var(--blue)';
    }
}

function createCasterElem(id: string, data: Caster = {}, isUncommitted = true) {
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
        (document.getElementById(`update-caster_${id}`) as HTMLButtonElement)
    );

    // Button click event
    document.getElementById(`update-caster_${id}`).addEventListener('click', e => {
        const id = (e.target as HTMLButtonElement).id.split('_')[1];
        try {
            casters.value[id] = {
                name: (document.getElementById(`caster-name-input_${id}`) as HTMLInputElement).value,
                twitter: (document.getElementById(`caster-twitter-input_${id}`) as HTMLInputElement).value,
                pronouns: (document.getElementById(`caster-pronoun-input_${id}`) as HTMLInputElement).value
            };
        } catch (error) {
            console.error(error);
            return;
        }

        (e.target as HTMLButtonElement).classList.remove('uncommitted');
    });
    document.getElementById(`remove-caster_${id}`).addEventListener('click', e => {
        const id = (e.target as HTMLButtonElement).id.split('_')[1];

        if (casters.value[id]) {
            // This creates an error, but works anyways.
            try {
                delete casters.value[id];
            } catch {}
        } else {
            deleteCasterElem(id);
            disableCreateCasterButton();
        }
    });
}

function disableCreateCasterButton() {
    btnCreateCaster.disabled = getCasterContainerCount() >= 3;
}

function getCasterContainerCount() {
    return document.querySelectorAll('.caster-container').length;
}

function casterObjectsMatch(val1: Caster, val2: Caster) {
    if (!val1 || !val2) return false;

    return !(val1.name !== val2.name || val1.twitter !== val2.twitter || val1.pronouns !== val2.pronouns);
}

function deleteCasterElem(id: string) {
    const container = document.getElementById(`caster-container_${id}`);
    container.parentNode.removeChild(container);
}

export function setUncommittedButtonDisabled(disabled: boolean): void {
    document.querySelectorAll('.update-button.uncommitted').forEach(elem => {
        (elem as HTMLButtonElement).disabled = disabled;
    });
}
