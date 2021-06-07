import { SetWinnersAutomatically } from 'types/schemas';

const setWinnersAutomatically = nodecg.Replicant<SetWinnersAutomatically>('setWinnersAutomatically');

setWinnersAutomatically.on('change', newValue => {
    (document.getElementById('auto-winner-set-toggle') as HTMLInputElement).checked = newValue;
});
