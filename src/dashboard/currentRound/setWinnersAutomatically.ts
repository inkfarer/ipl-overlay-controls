import { SetWinnersAutomatically } from 'types/schemas';

const setWinnersAutomatically = nodecg.Replicant<SetWinnersAutomatically>('setWinnersAutomatically');

const autoWinnerSetToggle = document.getElementById('auto-winner-set-toggle') as HTMLInputElement;

autoWinnerSetToggle.addEventListener('change', e => {
    setWinnersAutomatically.value = (e.target as HTMLInputElement).checked;
});

setWinnersAutomatically.on('change', newValue => {
    autoWinnerSetToggle.checked = newValue;
});
