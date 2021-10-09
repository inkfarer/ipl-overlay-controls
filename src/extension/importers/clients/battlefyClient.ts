import { HighlightedMatches, TournamentData } from 'schemas';
import axios from 'axios';
import { BattlefyTournamentData, Stage } from '../../types/battlefyTournamentData';
import { HighlightedMatchMetaData } from 'types/highlightedMatch';
import isEmpty from 'lodash/isEmpty';
import { MatchTeam } from '../../types/battlefyStage';
import { Team } from 'types/team';
import { BracketType, BracketTypeHelper } from 'types/enums/bracketType';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';

/**
 * Returns the matches with isMarkedLive as true for a list of Battlefy Stages
 * @param tournamentId Battlefy tournament ID
 * @param stages StageIDs of the stages to get highlighted matches from
 * @param getAllStages Get data for all stages
 */
export async function getBattlefyMatches(
    tournamentId: string,
    stages?: Array<string>,
    getAllStages?: boolean): Promise<HighlightedMatches> {
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
        throw new Error(`Got error from Battlefy: ${data.error}`);
    } else if (!data[0]) {
        throw new Error('Couldn\'t get tournament data from Battlefy.');
    }

    const battlefyTournamentData: BattlefyTournamentData = data[0];

    if (getAllStages) {
        return mapBattlefyRoundData(battlefyTournamentData.stages);
    } else {
        return mapBattlefyRoundData(battlefyTournamentData.stages.filter(stage => {
            return stages.includes(stage._id);
        }));
    }
}

function mapBattlefyRoundData(stages: Stage[]): HighlightedMatches {
    const result: HighlightedMatches = [];

    const validBracketStages = stages.filter(stage => {
        return ['swiss', 'elimination', 'roundrobin'].includes(stage.bracket.type);
    });

    for (let i = 0; i < validBracketStages.length; i++) {
        const stage = validBracketStages[i];

        const liveMatches = stage.matches.filter(match => {
            return match.isMarkedLive === true;
        });

        for (let j = 0; j < liveMatches.length; j++) {
            const match = liveMatches[j];
            if (!match.top.team || !match.bottom.team) continue;

            // Build Team info
            const teamAData = mapBattlefyTeamData(match.top);
            const teamBData = mapBattlefyTeamData(match.bottom);

            // Build MetaData for match
            let matchName = `Round ${match.roundNumber} Match `;
            if (match.matchType && ['loser', 'winner'].includes(match.matchType)) {
                if (match.matchType === 'loser') {
                    matchName += `L${match.matchNumber}`;
                } else if (match.matchType === 'winner') {
                    matchName += `C${match.matchNumber}`;
                }
            } else {
                matchName += match.matchNumber;
            }

            const metaData: HighlightedMatchMetaData = {
                id: match._id,
                stageName: stage.name,
                round: match.roundNumber,
                match: match.matchNumber,
                name: matchName
            };
            // If the completedAt exists then we add it to the metadata
            if (!isEmpty(match.completedAt)) {
                metaData.completionTime = match.completedAt;
            }
            result.push({
                meta: metaData,
                teamA: teamAData,
                teamB: teamBData
            });
        }
    }

    return result;
}

/**
 * Build the team data when given a MatchTeam from Battlefy
 * @param teamData data for a team in a match
 */
function mapBattlefyTeamData(teamData: MatchTeam): Team {
    const teamReturnObject: Team = {
        id: teamData.team._id,
        name: teamData.team.name,
        logoUrl: teamData.team.persistentTeam?.logoUrl,
        showLogo: true,
        players: []
    };
    for (let x = 0; x < teamData.team.players.length; x++) {
        const playerValue = teamData.team.players[x];
        const playerInfo = {
            name: playerValue.inGameName
        };
        teamReturnObject.players.push(playerInfo);
    }
    return teamReturnObject;
}

export async function getBattlefyTournamentData(id: string): Promise<TournamentData> {
    const tournamentInfo = await getBattlefyTournamentInfo(id);

    const requestURL = 'https://dtmwra1jsgyb0.cloudfront.net/tournaments/' + id + '/teams';
    return new Promise((resolve, reject) => {
        axios
            .get(requestURL)
            .then(response => {
                const { data } = response;
                if (data.error) {
                    reject(data.error);
                    return;
                }

                // Process the stages in a tournament for rep
                const tournamentStages: { name: string; id: string; type: BracketType}[] = [];
                tournamentInfo.stages.forEach(stage => {
                    tournamentStages.push({
                        name: stage.name,
                        id: stage._id,
                        type: BracketTypeHelper.fromBattlefy(stage.bracket.type, stage.bracket.style)
                    });
                });

                const teams: TournamentData = {
                    meta: {
                        id,
                        source: TournamentDataSource.BATTLEFY,
                        name: tournamentInfo.name,
                        url: `https://battlefy.com/${tournamentInfo.organization.slug}/${tournamentInfo.slug}/${tournamentInfo._id}/info?infoTab=details`
                    },
                    teams: [],
                    stages: tournamentStages
                };
                for (let i = 0; i < data.length; i++) {
                    const element = data[i];
                    const teamInfo: Team = {
                        id: element._id,
                        name: element.name,
                        logoUrl: element.persistentTeam.logoUrl,
                        showLogo: true,
                        players: []
                    };
                    for (let j = 0; j < element.players.length; j++) {
                        const elementPlayer = element.players[j];
                        const playerInfo = {
                            name: elementPlayer.inGameName,
                            username: elementPlayer.username
                        };
                        teamInfo.players.push(playerInfo);
                    }

                    teams.teams.push(teamInfo);
                }

                resolve(teams);
            })
            .catch(err => {
                reject(err);
            });
    });
}

async function getBattlefyTournamentInfo(id: string): Promise<BattlefyTournamentData> {
    // API link gets all the details on a battlefy tournament
    // eslint-disable-next-line max-len
    const url = `https://api.battlefy.com/tournaments/${id}?extend%5Bcampaign%5D%5Bsponsor%5D=true&extend%5Bstages%5D%5B%24query%5D%5BdeletedAt%5D%5B%24exists%5D=false&extend%5Bstages%5D%5B%24opts%5D%5Bname%5D=1&extend%5Bstages%5D%5B%24opts%5D%5Bbracket%5D=1&extend%5Bstages%5D%5B%24opts%5D%5BstartTime%5D=1&extend%5Bstages%5D%5B%24opts%5D%5BendTime%5D=1&extend%5Bstages%5D%5B%24opts%5D%5Bschedule%5D=1&extend%5Bstages%5D%5B%24opts%5D%5BmatchCheckinDuration%5D=1&extend%5Bstages%5D%5B%24opts%5D%5BhasCheckinTimer%5D=1&extend%5Bstages%5D%5B%24opts%5D%5BhasStarted%5D=1&extend%5Bstages%5D%5B%24opts%5D%5BhasMatchCheckin%5D=1&extend%5Borganization%5D%5Bowner%5D%5B%24opts%5D%5Btimezone%5D=1&extend%5Borganization%5D%5B%24opts%5D%5Bname%5D=1&extend%5Borganization%5D%5B%24opts%5D%5Bslug%5D=1&extend%5Borganization%5D%5B%24opts%5D%5BownerID%5D=1&extend%5Borganization%5D%5B%24opts%5D%5BlogoUrl%5D=1&extend%5Borganization%5D%5B%24opts%5D%5BbannerUrl%5D=1&extend%5Borganization%5D%5B%24opts%5D%5Bfeatures%5D=1&extend%5Borganization%5D%5B%24opts%5D%5Bfollowers%5D=1&extend%5Bgame%5D=true&extend%5Bstreams%5D%5B%24query%5D%5BdeletedAt%5D%5B%24exists%5D=false`;
    const response = await axios.get(url);
    return response.data[0];  // This URL provides each tournament as an array of objects
}
