import { HighlightedMatches, TournamentData } from 'schemas';
import axios from 'axios';
import { BattlefyTeamsResponse, BattlefyTournamentData } from '../../types/battlefyTournamentData';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import {
    mapBattlefyStagesToHighlightedMatches,
    mapBattlefyStagesToTournamentData
} from '../mappers/battlefyDataMapper';
import i18next from 'i18next';

/**
 * Returns the matches with isMarkedLive as true for a list of Battlefy Stages
 * @param tournamentId Battlefy tournament ID
 * @param stages StageIDs of the stages to get highlighted matches from
 * @param getAllStages Get data for all stages
 */
export async function getBattlefyMatches(
    tournamentId: string,
    stages?: Array<string>,
    getAllStages?: boolean
): Promise<HighlightedMatches> {
    const requestUrl = `https://api.battlefy.com/tournaments/${tournamentId}`
        + '?extend[stages][$query][deletedAt][$exists]=false'
        + '&extend[stages][matches]=1'
        + '&extend[stages][$opts][name]=1'
        + '&extend[stages][$opts][matches][$elemMatch][isMarkedLive]=true'
        + '&extend[stages.matches.top.team]=1'
        + '&extend[stages.matches.bottom.team]=1'
        + '&extend[stages][$opts][bracket]=1'
        + '&extend[stages.matches.top.team.persistentTeam]=1'
        + '&extend[stages.matches.bottom.team.persistentTeam]=1'
        + '&extend[stages.matches.top.team.players]=1'
        + '&extend[stages.matches.bottom.team.players]=1';

    const battlefyResponse = await axios.get(requestUrl);
    const { data } = battlefyResponse;

    if (data.error) {
        throw new Error(i18next.t('battlefyClient.battlefyReturnedError', { message: data.error }));
    } else if (!data[0]) {
        throw new Error(i18next.t('battlefyClient.battlefyReturnedNoData'));
    }

    const battlefyTournamentData: BattlefyTournamentData = data[0];

    if (getAllStages) {
        return mapBattlefyStagesToHighlightedMatches(battlefyTournamentData.stages);
    } else {
        return mapBattlefyStagesToHighlightedMatches(battlefyTournamentData.stages.filter(stage => {
            return stages.includes(stage._id);
        }));
    }
}

export function getBattlefyTournamentUrl(tournament: BattlefyTournamentData): string {
    return `https://battlefy.com/${tournament.organization.slug}/${tournament.slug}/${tournament._id}/info?infoTab=details`;
}

export async function getBattlefyTournamentData(id: string): Promise<TournamentData> {
    const tournamentInfo = await getBattlefyTournamentInfo(id);

    const requestURL = 'https://dtmwra1jsgyb0.cloudfront.net/tournaments/' + id + '/teams';
    return new Promise((resolve, reject) => {
        axios
            .get<BattlefyTeamsResponse>(requestURL)
            .then(response => {
                const { data } = response;
                if (!Array.isArray(data)) {
                    if (data.error) {
                        return reject(new Error(data.error));
                    } else {
                        return reject(new Error(i18next.t('battlefyClient.battlefyReturnedUnknownResponse')));
                    }
                }

                const result: TournamentData = {
                    meta: {
                        id,
                        source: TournamentDataSource.BATTLEFY,
                        name: tournamentInfo.name,
                        shortName: tournamentInfo.name ?? i18next.t('battlefyClient.placeholderTournamentName'),
                        url: getBattlefyTournamentUrl(tournamentInfo)
                    },
                    teams: data
                        .filter(team => !!team.players && team.players?.length > 0)
                        .map(team => ({
                            id: team._id,
                            name: team.name,
                            logoUrl: team.persistentTeam?.logoUrl,
                            showLogo: true,
                            players: team.players.map(elementPlayer => ({
                                name: elementPlayer.inGameName,
                                username: elementPlayer.username
                            }))
                        })),
                    stages: mapBattlefyStagesToTournamentData(tournamentInfo.stages)
                };

                resolve(result);
            })
            .catch(err => {
                reject(err);
            });
    });
}

export async function getBattlefyTournamentInfo(id: string): Promise<BattlefyTournamentData> {
    // API link gets all the details on a battlefy tournament
    const url = `https://api.battlefy.com/tournaments/${id}?extend%5Bcampaign%5D%5Bsponsor%5D=true&extend%5Bstages%5D%5B%24query%5D%5BdeletedAt%5D%5B%24exists%5D=false&extend%5Bstages%5D%5B%24opts%5D%5Bname%5D=1&extend%5Bstages%5D%5B%24opts%5D%5Bbracket%5D=1&extend%5Bstages%5D%5B%24opts%5D%5BstartTime%5D=1&extend%5Bstages%5D%5B%24opts%5D%5BendTime%5D=1&extend%5Bstages%5D%5B%24opts%5D%5Bschedule%5D=1&extend%5Bstages%5D%5B%24opts%5D%5BmatchCheckinDuration%5D=1&extend%5Bstages%5D%5B%24opts%5D%5BhasCheckinTimer%5D=1&extend%5Bstages%5D%5B%24opts%5D%5BhasStarted%5D=1&extend%5Bstages%5D%5B%24opts%5D%5BhasMatchCheckin%5D=1&extend%5Borganization%5D%5Bowner%5D%5B%24opts%5D%5Btimezone%5D=1&extend%5Borganization%5D%5B%24opts%5D%5Bname%5D=1&extend%5Borganization%5D%5B%24opts%5D%5Bslug%5D=1&extend%5Borganization%5D%5B%24opts%5D%5BownerID%5D=1&extend%5Borganization%5D%5B%24opts%5D%5BlogoUrl%5D=1&extend%5Borganization%5D%5B%24opts%5D%5BbannerUrl%5D=1&extend%5Borganization%5D%5B%24opts%5D%5Bfeatures%5D=1&extend%5Borganization%5D%5B%24opts%5D%5Bfollowers%5D=1&extend%5Bgame%5D=true&extend%5Bstreams%5D%5B%24query%5D%5BdeletedAt%5D%5B%24exists%5D=false`;
    const response = await axios.get(url);
    return response.data[0];  // This URL provides each tournament as an array of objects
}
