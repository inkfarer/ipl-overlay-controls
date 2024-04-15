import { HighlightedMatches, TournamentData } from 'schemas';
import { setActiveRoundTeams } from '../helpers/activeRoundHelper';
import { setNextRoundTeams } from '../helpers/nextRoundHelper';
import * as nodecgContext from '../helpers/nodecg';
import { Team } from 'types/team';
import { generateId } from '../../helpers/generateId';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import isEmpty from 'lodash/isEmpty';
import { updateTournamentData } from './clients/radiaClient';
import { ActiveRound, NextRound, RadiaSettings } from 'schemas';
import { addDots, isBlank } from '../../helpers/stringHelper';
import { getBattlefyTournamentInfo, getBattlefyTournamentUrl } from './clients/battlefyClient';
import { mapBattlefyStagesToTournamentData } from './mappers/battlefyDataMapper';
import { clearMatchesWithUnknownTeams } from '../replicants/matchStore';
import i18next from 'i18next';

const nodecg = nodecgContext.get();
const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');
const highlightedMatchData = nodecg.Replicant<HighlightedMatches>('highlightedMatches');
const radiaSettings = nodecg.Replicant<RadiaSettings>('radiaSettings');
const activeRound = nodecg.Replicant<ActiveRound>('activeRound');
const nextRound = nodecg.Replicant<NextRound>('nextRound');

export function teamExists(teamId: string): boolean {
    return tournamentData.value.teams.some(team => team.id === teamId);
}

export function updateTournamentDataReplicants(data: TournamentData): void {
    if (data.teams.length <= 0) {
        throw new Error(i18next.t('tournamentDataHelper.noTeamsFound'));
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
    if (tournamentData.value.meta.id === data.meta.id && !isBlank(tournamentData.value.meta.shortName)) {
        data.meta.shortName = tournamentData.value.meta.shortName;
    }

    tournamentData.value = data;
    highlightedMatchData.value = []; // Clear highlighted matches as tournament data has changed
    clearMatchesWithUnknownTeams(data);
    updateRadiaTournamentData(data.meta?.url, data.meta?.name);

    const firstTeam = data.teams[0];
    const secondTeam = data.teams[1] ?? data.teams[0];

    const teamIdExists = (teamId: string) => data.teams.some(team => team.id === teamId);

    if (!teamIdExists(activeRound.value.teamA.id) || !teamIdExists(activeRound.value.teamB.id)) {
        setActiveRoundTeams(activeRound.value, firstTeam.id, secondTeam.id);
    }

    if (!teamIdExists(nextRound.value.teamA.id) || !teamIdExists(nextRound.value.teamB.id)) {
        if (data.teams.length < 5) {
            setNextRoundTeams(
                (data.teams[data.teams.length - 2]?.id ?? firstTeam.id),
                data.teams[data.teams.length - 1].id);
        } else {
            setNextRoundTeams(data.teams[2].id, data.teams[3].id);
        }
    }
}

export async function parseUploadedTeamData(data: Team[] | TournamentData, dataUrl: string): Promise<TournamentData> {
    if (Array.isArray(data)) {
        if (isEmpty(data)) {
            throw new Error(i18next.t('tournamentDataHelper.noTeamsFound'));
        }

        return {
            meta: {
                id: dataUrl,
                source: TournamentDataSource.UPLOAD,
                shortName: i18next.t('tournamentDataHelper.placeholderUploadedTournamentName')
            },
            teams: normalizeTeams(data)
        };
    } else if (data instanceof Object) {
        if (isEmpty(data.teams)) {
            throw new Error(i18next.t('tournamentDataHelper.noTeamsFound'));
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
                nodecg.log.warn(i18next.t('tournamentDataHelper.battlefyDataImportFailed', { tournamentId: data.meta.id }), e);
            }
        }

        if (isBlank(data.meta.shortName)) {
            data.meta.shortName = isBlank(data.meta.name) ? i18next.t('tournamentDataHelper.placeholderTournamentName') : data.meta.name;
        }

        return result;
    } else {
        throw new Error(i18next.t('tournamentDataHelper.tournamentDataParsingFailed'));
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
        && !isBlank(radiaSettings.value.guildID)
        && !isBlank(tournamentUrl)
        && !isBlank(tournamentName)
    ) {
        try {
            await updateTournamentData(radiaSettings.value.guildID, tournamentUrl, tournamentName);
        } catch (e) {
            nodecg.log.warn(i18next.t('tournamentDataHelper.radiaTournamentDataUpdateFailed', { message: e }));
        }
    }
}
