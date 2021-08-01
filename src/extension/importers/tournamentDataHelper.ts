import { HighlightedMatches, TournamentData } from 'schemas';
import { setActiveRoundTeams } from '../replicants/activeRoundHelper';
import { setNextRoundTeams } from '../replicants/nextRoundHelper';
import * as nodecgContext from '../helpers/nodecg';
import { Team } from 'types/team';
import { generateId } from '../../helpers/generateId';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';

const nodecg = nodecgContext.get();
const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');
const highlightedMatchData = nodecg.Replicant<HighlightedMatches>('highlightedMatches');

export function updateTeamDataReplicants(data: TournamentData): void {
    if (data.teams.length <= 0) {
        throw new Error('Tournament has no teams.');
    }

    data.teams.sort((a, b) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();

        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        return 0;
    });

    tournamentData.value = data;

    highlightedMatchData.value = []; // Clear highlighted matches as tournament data has changed

    const firstTeam = data.teams[0];
    const secondTeam = data.teams[1] || data.teams[0];

    setActiveRoundTeams(firstTeam.id, secondTeam.id);
    setNextRoundTeams((data.teams[2].id || firstTeam.id), (data.teams[3].id || secondTeam.id));
}

export function handleRawData(teams: Team[], dataUrl: string): TournamentData {
    for (let i = 0; i < teams.length; i++) {
        const element = teams[i];
        if (element.id == null) {
            element.id = generateId();
        }
        if (element.showLogo == null) {
            element.showLogo = true;
        }
    }

    return {
        meta: {
            id: dataUrl,
            source: TournamentDataSource.UPLOAD
        },
        teams
    };
}
