import { HighlightedMatches, TournamentData } from 'schemas';
import { setActiveRoundTeams } from '../replicants/activeRoundHelper';
import { setNextRoundTeams } from '../replicants/nextRoundHelper';
import * as nodecgContext from '../helpers/nodecg';
import { Team } from 'types/team';
import { generateId } from '../../helpers/generateId';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import isEmpty from 'lodash/isEmpty';
import { updateTournamentData } from './clients/radiaClient';
import { ActiveRound, RadiaSettings } from '../../types/schemas';
import { addDots } from '../../helpers/stringHelper';
import { getBattlefyTournamentInfo, getBattlefyTournamentUrl } from './clients/battlefyClient';
import { mapBattlefyStagesToTournamentData } from './mappers/battlefyDataMapper';
import { clearMatchesWithUnknownTeams } from './roundDataHelper';

const nodecg = nodecgContext.get();
const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');
const highlightedMatchData = nodecg.Replicant<HighlightedMatches>('highlightedMatches');
const radiaSettings = nodecg.Replicant<RadiaSettings>('radiaSettings');
const activeRound = nodecg.Replicant<ActiveRound>('activeRound');

export function updateTournamentDataReplicants(data: TournamentData): void {
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

    data.teams = normalizeNames(data.teams);

    tournamentData.value = data;
    highlightedMatchData.value = []; // Clear highlighted matches as tournament data has changed
    clearMatchesWithUnknownTeams(data);
    updateRadiaTournamentData(data.meta?.url, data.meta?.name);

    const firstTeam = data.teams[0];
    const secondTeam = data.teams[1] ?? data.teams[0];

    setActiveRoundTeams(activeRound.value, firstTeam.id, secondTeam.id);

    if (data.teams.length < 5) {
        setNextRoundTeams(
            (data.teams[data.teams.length - 2]?.id ?? firstTeam.id),
            data.teams[data.teams.length - 1].id);
    } else {
        setNextRoundTeams(data.teams[2].id, data.teams[3].id);
    }
}

export async function parseUploadedTeamData(data: Team[] | TournamentData, dataUrl: string): Promise<TournamentData> {
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

        const result = {
            ...data,
            teams: normalizeTeams(data.teams)
        };

        if (data.meta.source === TournamentDataSource.BATTLEFY
            && (data.stages == null
            || isEmpty(data.meta.name)
            || isEmpty(data.meta.url))
        ) {
            try {
                const battlefyData = await getBattlefyTournamentInfo(data.meta.id);
                if (data.stages == null) {
                    result.stages = mapBattlefyStagesToTournamentData(battlefyData.stages);
                }
                if (isEmpty(data.meta.name)) {
                    result.meta.name = battlefyData.name;
                }
                if (isEmpty(data.meta.url)) {
                    data.meta.url = getBattlefyTournamentUrl(battlefyData);
                }
            } catch (e) {
                nodecg.log.warn(`Could not fetch Battlefy data for tournament ${data.meta.id}`, e);
            }
        }

        return result;
    } else {
        throw new Error('Invalid data provided to parseUploadedTeamData()');
    }
}

function normalizeTeams(teams: Team[]): Team[] {
    return normalizeNames(teams).map(team => {
        if (team.id == null) {
            team.id = generateId();
        }
        if (team.showLogo == null) {
            team.showLogo = true;
        }

        return team;
    });
}

const NAME_LENGTH_CAP = 512;
function normalizeNames(teams: Team[]): Team[] {
    return teams.map(team => ({
        ...team,
        name: addDots(team.name, NAME_LENGTH_CAP),
        players: team.players?.map(player => ({ ...player, name: addDots(player.name, NAME_LENGTH_CAP) }))
    }));
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
