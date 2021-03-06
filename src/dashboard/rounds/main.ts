import { addChangeReminder, fillList } from '../globalScripts';

import '../styles/globalStyles.css';
import './rounds.css';
import { generateId } from '../../helpers/generateId';
import { ActiveRoundId, Round, Rounds } from 'schemas';
import { splatModes, splatStages } from '../../helpers/splatoonData';

const rounds = nodecg.Replicant<Rounds>('rounds');
const activeRoundId = nodecg.Replicant<ActiveRoundId>('activeRoundId');

document.getElementById('create-3-game-round').onclick = () => {
    createRoundElem(3, generateId(), true);
};

document.getElementById('create-5-game-round').onclick = () => {
    createRoundElem(5, generateId(), true);
};

document.getElementById('create-7-game-round').onclick = () => {
    createRoundElem(7, generateId(), true);
};

document.getElementById('reset-rounds').onclick = () => resetRounds();

function resetRounds() {
    rounds.value = {
        '0': {
            meta: {
                name: 'Default round'
            },
            games: [
                {
                    stage: 'MakoMart',
                    mode: 'Clam Blitz'
                },
                {
                    stage: 'Ancho-V Games',
                    mode: 'Tower Control'
                },
                {
                    stage: 'Wahoo World',
                    mode: 'Rainmaker'
                }
            ]
        }
    };
    activeRoundId.value = '0';
}

function createRoundElem(numberOfGames: number, id: string, remindToUpdate: boolean) {
    if (typeof numberOfGames !== 'number'
        || numberOfGames >= 8
        || numberOfGames <= 0) {
        throw new Error('Rounds with only up to 7 stages are supported.');
    }

    const reminderCreatingElements = [];
    const roundElem = document.createElement('div');
    roundElem.classList.add('space');
    roundElem.classList.add('round');
    roundElem.id = `round_${id}`;

    const nameInput = document.createElement('input');
    nameInput.id = `name-input_${id}`;
    nameInput.value = `Round ${id}`;
    nameInput.type = 'text';

    const nameInputLabel = document.createElement('div');
    nameInputLabel.innerText = 'Round name';
    nameInputLabel.classList.add('input-label');

    reminderCreatingElements.push(nameInput);
    roundElem.appendChild(nameInputLabel);
    roundElem.appendChild(nameInput);

    for (let i = 0; i < numberOfGames; i++) {
        // Separator
        const separator = document.createElement('div');
        separator.classList.add('separator');
        const separatorSpan = document.createElement('span') as HTMLSpanElement;
        separatorSpan.innerText = String(i + 1);
        separator.appendChild(separatorSpan);
        roundElem.appendChild(separator);

        // Stage select
        const stageSelector = document.createElement('select');
        stageSelector.id = `stage-selector_${id}_${i}`;
        stageSelector.classList.add('stage-selector');
        fillList(stageSelector, splatStages);
        stageSelector.value = 'Unknown Stage';
        roundElem.appendChild(stageSelector);
        reminderCreatingElements.push(stageSelector);

        // Mode select
        const modeSelector = document.createElement('select');
        modeSelector.id = `mode-selector_${id}_${i}`;
        modeSelector.classList.add('mode-selector');
        fillList(modeSelector, splatModes);
        modeSelector.value = 'Unknown Mode';
        roundElem.appendChild(modeSelector);
        reminderCreatingElements.push(modeSelector);
    }

    // Update button
    const updateButton = document.createElement('button');
    updateButton.innerText = 'update';
    updateButton.id = `update-round_${id}`;
    if (remindToUpdate) {
        updateButton.style.backgroundColor = 'var(--red)';
    }

    updateButton.onclick = event => {
        const buttonId = (event.target as HTMLButtonElement).id.split('_')[1];
        const numberOfGames = document
            .getElementById(`round_${buttonId}`)
            .querySelectorAll('select').length / 2;

        const nameInput = document.getElementById('name-input_' + buttonId) as HTMLInputElement;
        const games = [];

        for (let i = 0; i < numberOfGames; i++) {
            const currentGame = {
                stage: '',
                mode: ''
            };
            const id = buttonId + '_' + i;
            const stageSelector = document.getElementById(`stage-selector_${id}`) as HTMLSelectElement;
            currentGame.stage = stageSelector.value;

            const modeSelector = document.getElementById(`mode-selector_${id}`) as HTMLSelectElement;
            currentGame.mode = modeSelector.value;
            games.push(currentGame);
        }

        rounds.value[buttonId] = {
            meta: { name: nameInput.value },
            games
        };
    };

    updateButton.classList.add('max-width');

    addChangeReminder(reminderCreatingElements, updateButton);

    // Remove button
    const removeButton = document.createElement('button');
    removeButton.style.backgroundColor = 'var(--red)';
    removeButton.id = 'removeButton_' + id;
    removeButton.innerText = 'REMOVE';
    removeButton.classList.add('max-width');
    removeButton.onclick = event => {
        const buttonId = (event.target as HTMLButtonElement).id.split('_')[1];
        if (activeRoundId.value === buttonId) {
            activeRoundId.value = Object.keys(rounds.value)[0];
        }

        if (rounds.value[buttonId]) {
            // This creates an error, but works anyways.
            try {
                delete rounds.value[buttonId];
            } catch {}
        } else {
            deleteRoundElem(buttonId);
        }
    };

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('layout');
    buttonContainer.classList.add('horizontal');

    buttonContainer.appendChild(updateButton);
    buttonContainer.appendChild(removeButton);

    roundElem.appendChild(buttonContainer);

    document.getElementById('round-grid')
        .prepend(roundElem);
}

function updateRoundElem(id: string, data: Round) {
    const nameInput = document.getElementById(`name-input_${id}`) as HTMLInputElement;
    nameInput.value = data.meta.name;

    const numberOfGames = document
        .getElementById(`round_${id}`)
        .querySelectorAll('select')
        .length / 2;

    for (let i = 0; i < numberOfGames; i++) {
        const stageSelector = document.getElementById(`stage-selector_${id}_${i}`) as HTMLSelectElement;
        const modeSelector = document.getElementById(`mode-selector_${id}_${i}`) as HTMLSelectElement;

        stageSelector.value = data.games[i].stage;
        modeSelector.value = data.games[i].mode;
    }
}

function deleteRoundElem(id: string) {
    const roundSpace = document.getElementById(`round_${id}`);
    if (roundSpace) {
        roundSpace.parentNode.removeChild(roundSpace);
    }
}

function updateOrCreateCreateRoundElem(id: string, data: Round) {
    const container = document.getElementById(`round_${id}`);
    if (container) {
        updateRoundElem(id, data);
    } else {
        createRoundElem(data.games.length, id, false);
        updateRoundElem(id, data);
    }
}

rounds.on('change', (newValue, oldValue) => {
    for (const id in newValue) {
        if (!Object.prototype.hasOwnProperty.call(newValue, id)) continue;

        const object = newValue[id];

        if (oldValue) {
            if (!roundObjectsMatch(object, oldValue[id])) {
                updateOrCreateCreateRoundElem(id, object);
            }
        } else {
            updateOrCreateCreateRoundElem(id, object);
        }
    }

    // Handle deletions
    if (oldValue) {
        for (const id in oldValue) {
            if (!Object.prototype.hasOwnProperty.call(oldValue, id)) continue;

            if (!newValue[id]) {
                deleteRoundElem(id);
            }
        }
    }
});

function roundObjectsMatch(val1: Round, val2: Round) {
    if (!val1 || !val2) return false;
    if (val1.meta.name !== val2.meta.name) return false;
    if (val1.games.length !== val2.games.length) return false;

    for (let i = 0; i < val1.games.length; i++) {
        const val1Game = val1.games[i];
        const val2Game = val2.games[i];

        if (val1Game.stage !== val2Game.stage) return false;
        if (val1Game.mode !== val2Game.mode) return false;
    }

    return true;
}
