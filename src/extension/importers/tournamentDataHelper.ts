import { HighlightedMatches, TournamentData } from 'schemas';
import { setActiveRoundTeams } from '../replicants/activeRoundHelper';
import { setNextRoundTeams } from '../replicants/nextRoundHelper';
import * as nodecgContext from '../helpers/nodecg';
import { Team } from 'types/team';
import { generateId } from '../../helpers/generateId';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import isEmpty from 'lodash/isEmpty';
import { updateTournamentData } from './clients/radiaClient';
import { RadiaSettings } from '../../types/schemas';

const nodecg = nodecgContext.get();
const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');
const highlightedMatchData = nodecg.Replicant<HighlightedMatches>('highlightedMatches');
const radiaSettings = nodecg.Replicant<RadiaSettings>('radiaSettings');

export function updateTeamData(data: TournamentData): void {
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
    updateRadiaTournamentData(data.meta?.url, data.meta?.name);

    const firstTeam = data.teams[0];
    const secondTeam = data.teams[1] || data.teams[0];

    setActiveRoundTeams(firstTeam.id, secondTeam.id);

    if (data.teams.length < 5) {
        setNextRoundTeams(
            (data.teams[data.teams.length - 2]?.id || firstTeam.id),
            data.teams[data.teams.length - 1].id);
    } else {
        setNextRoundTeams(data.teams[2].id, data.teams[3].id);
    }
}

export function parseUploadedTeamData(data: Team[] | TournamentData, dataUrl: string): TournamentData {
    if (Array.isArray(data)) {
        if (isEmpty(data)) {
            throw new Error('Provided data is missing teams.');
        }

        return {
            meta: {
                id: dataUrl,
                source: TournamentDataSource.UPLOAD
            },
            teams: normalizeTeams(data)
        };
    } else if (data instanceof Object) {
        if (isEmpty(data.teams)) {
            throw new Error('Provided data is missing teams.');
        }

        if (isEmpty(data.meta.id)) {
            data.meta.id = dataUrl;
        }
        if (isEmpty(data.meta.source)) {
            data.meta.source = TournamentDataSource.UPLOAD;
        }

        return {
            ...data,
            teams: normalizeTeams(data.teams)
        };
    } else {
        throw new Error('Invalid data provided to parseUploadedTeamData()');
    }
}

function normalizeTeams(teams: Team[]): Team[] {
    return teams.map(team => {
        if (team.id == null) {
            team.id = generateId();
        }
        if (team.showLogo == null) {
            team.showLogo = true;
        }

        return team;
    });
}

export async function updateRadiaTournamentData(tournamentUrl: string, tournamentName: string): Promise<void> {
    if (radiaSettings.value.updateOnImport
        && !isEmpty(radiaSettings.value.guildID)
        && !isEmpty(tournamentUrl)
        && !isEmpty(tournamentName)
    ) {
        try {
            await updateTournamentData(radiaSettings.value.guildID, tournamentUrl, tournamentName);
        } catch (e) {
            nodecg.log.warn(`Radia tournament data update failed: ${e}`);
        }
    }
}
