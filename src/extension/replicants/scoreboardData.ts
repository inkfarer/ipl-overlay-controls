import * as nodecgContext from '../helpers/nodecg';
import { ActiveRound, ScoreboardData, TournamentData } from '../../types/schemas';

const nodecg = nodecgContext.get();
const scoreboardData = nodecg.Replicant<ScoreboardData>('scoreboardData');
const activeRound = nodecg.Replicant<ActiveRound>('activeRound');
const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');

activeRound.on('change', (newValue, oldValue) => {
    if (newValue.match.name !== oldValue?.match.name) {
        setFlavorText(tournamentData.value.meta.shortName, newValue.match.name);
    }
});

tournamentData.on('change', (newValue, oldValue) => {
    if (!oldValue) return;

    if (newValue.meta.shortName !== oldValue.meta.shortName) {
        setFlavorText(newValue.meta.shortName, activeRound.value.match.name);
    }
});

export function setFlavorText(shortTournamentName: string, matchName: string): void {
    scoreboardData.value.flavorText = `${shortTournamentName} - ${matchName}`;
}
