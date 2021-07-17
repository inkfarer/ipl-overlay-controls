import { addChangeReminder, fillList } from '../globalScripts';
import { generateId } from '../../helpers/generateId';
import { Round, RoundStore } from 'schemas';
import { splatModes, splatStages } from '../../helpers/splatoonData';
import { GameWinner } from 'types/gameWinner';
import { UpdateRoundStoreRequest } from 'types/messages/roundStore';
import isEqual from 'lodash/isEqual';

import '../styles/globalStyles.css';
import './rounds.css';

const rounds = nodecg.Replicant<RoundStore>('roundStore');

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
                name: 'Default round',
                isCompleted: false
            },
            games: [
                {
                    stage: 'MakoMart',
                    mode: 'Clam Blitz',
                    winner: GameWinner.NO_WINNER
                },
                {
                    stage: 'Ancho-V Games',
                    mode: 'Tower Control',
                    winner: GameWinner.NO_WINNER
                },
                {
                    stage: 'Wahoo World',
                    mode: 'Rainmaker',
                    winner: GameWinner.NO_WINNER
                }
            ]
        }
    };
}

function createRoundElem(numberOfGames: number, id: string, remindToUpdate: boolean) {
    if (typeof numberOfGames !== 'number' || numberOfGames > 7 || numberOfGames <= 0) {
        throw new Error('Rounds with only up to 7 games are supported.');
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
        const games: {stage: string, mode: string}[] = [];

        for (let i = 0; i < numberOfGames; i++) {
            const id = buttonId + '_' + i;
            const stageSelector = document.getElementById(`stage-selector_${id}`) as HTMLSelectElement;
            const modeSelector = document.getElementById(`mode-selector_${id}`) as HTMLSelectElement;

            const currentGame = {
                stage: stageSelector.value,
                mode: modeSelector.value,
                winner: GameWinner.NO_WINNER
            };
            games.push(currentGame);
        }

        nodecg.sendMessage('updateRoundStore',
            { id: buttonId, roundName: nameInput.value, games: games } as UpdateRoundStoreRequest);
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
            if (!isEqual(object, oldValue[id])) {
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
