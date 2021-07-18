import { RoundStore, TournamentData, NextRound, Round } from 'schemas';
import { addChangeReminder, addDots, addSelector, clearSelectors, createSelector } from '../globalScripts';
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons/faInfoCircle';

import '../helpers/buttonConfirm';
import '../styles/globalStyles.css';
import './nextRound.css';
import { SetRoundRequest } from 'types/messages/rounds';

library.add(faInfoCircle);
dom.watch();

const rounds = nodecg.Replicant<RoundStore>('roundStore');
const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');
const nextRound = nodecg.Replicant<NextRound>('nextRound');

const nextRoundUpdateButton = document.getElementById('update-next-round-btn') as HTMLButtonElement;
const beginNextMatchButton = document.getElementById('begin-next-match-btn') as HTMLButtonElement;
const roundSelector = document.getElementById('round-selector') as HTMLSelectElement;
const nextTeamASelector = document.getElementById('next-team-a-selector') as HTMLSelectElement;
const nextTeamBSelector = document.getElementById('next-team-b-selector') as HTMLSelectElement;
const savedProgressMessage = document.getElementById('saved-progress-message') as HTMLDivElement;
const savedProgressMessageText = savedProgressMessage.querySelector('.content') as HTMLElement;

NodeCG.waitForReplicants(rounds, nextRound, tournamentData).then(() => {
    rounds.on('change', newValue => {
        clearSelectors('round-selector');
        for (const [key, value] of Object.entries(newValue)) {
            roundSelector.appendChild(createSelector(value.meta.name, key));
        }

        const newNextRound = newValue[nextRound.value.round.id];

        if (newNextRound) {
            checkNextRoundProgress(newNextRound);
        } else {
            roundSelector.appendChild(createSelector(nextRound.value.round.name, nextRound.value.round.id));
        }

        roundSelector.value = nextRound.value.round.id;
    });

    nextRound.on('change', newValue => {
        nextTeamASelector.value = newValue.teamA.id;
        nextTeamBSelector.value = newValue.teamB.id;
        roundSelector.value = newValue.round.id;

        const roundValue = rounds.value[newValue.round.id];
        if (roundValue) {
            checkNextRoundProgress(roundValue);
        }
    });

    tournamentData.on('change', newValue => {
        clearSelectors('team-selector');
        for (let i = 0; i < newValue.teams.length; i++) {
            const element = newValue.teams[i];
            addSelector(addDots(element.name), 'team-selector', element.id);
        }

        nextTeamASelector.value = nextRound.value.teamA.id;
        nextTeamBSelector.value = nextRound.value.teamB.id;
    });
});

nextRoundUpdateButton.addEventListener('click', () => {
    nodecg.sendMessage('setNextRound', {
        teamAId: nextTeamASelector.value,
        teamBId: nextTeamBSelector.value,
        roundId: roundSelector.value
    } as SetRoundRequest);
});

beginNextMatchButton.addEventListener('confirm', () => {
    nodecg.sendMessage('beginNextMatch');
});

addChangeReminder([roundSelector, nextTeamASelector, nextTeamBSelector], nextRoundUpdateButton);

function checkNextRoundProgress(nextRound: Round) {
    const roundHasProgress = (nextRound.teamA?.score || 0) + (nextRound.teamB?.score || 0) > 0;

    if (nextRound.meta.isCompleted) {
        savedProgressMessageText.innerText = `'${nextRound.meta.name}' is already completed.`;
    } else if (roundHasProgress) {
        savedProgressMessageText.innerText = `'${nextRound.meta.name}' already has saved progress.`;
    }

    if (roundHasProgress) {
        savedProgressMessageText.innerText += `\n(${nextRound.teamA.name} vs ${nextRound.teamB.name})`;
        savedProgressMessage.style.display = '';
    } else {
        savedProgressMessage.style.display = 'none';
    }
}
