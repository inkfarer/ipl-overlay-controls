/*
This file handles getting highlighted matches from different services
 */
import axios from 'axios';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import * as nodecgContext from './util/nodecg';
import { HighlightedMatch, TournamentData } from 'schemas';
import { Team } from 'types/team';
import { MatchTeam } from './types/battlefyStage';
import { ImportStatus } from 'types/importStatus';
import { BattlefyTournamentData, Stage } from './types/battlefyTournamentData';

const nodecg = nodecgContext.get();

const highlightedMatchData = nodecg.Replicant<HighlightedMatch>('highlightedMatches');
const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');

/**
 * Handles the listener for when request is triggered
 */
nodecg.listenFor('getHighlightedMatches', async (data, ack: UnhandledListenForCb) => {
    if ((!data.stages && !data.getAllStages)) {
        ack(new Error('Missing arguments.'), null);
        return;
    }

    switch (tournamentData.value.meta.source) {
        case 'Battlefy':
            getBattlefyMatches(data.stages, data.getAllStages)
                .then(data => {
                    if (data.length > 0) {
                        updateMatchReplicant(data);
                        ack(null, {
                            status: ImportStatus.Success,
                            data: data
                        });
                    } else {
                        ack(null, {
                            status: ImportStatus.NoData,
                            data: data
                        });
                    }
                })
                .catch(err => {
                    ack(err);
                });
            break;
        default:
            ack(new Error('Invalid method given.'));
    }
});

/**
 * Assigns data to highlightedMatches replicant
 * @param data Data handed back from data provider
 */
export function updateMatchReplicant(data: HighlightedMatch): void {
    data.sort((a, b) => {
        const keyA = `${a.meta.stageName} ${a.meta.name}`;
        const keyB = `${b.meta.stageName} ${b.meta.name}`;

        if (keyA < keyB) {
            return -1;
        }
        if (keyA > keyB) {
            return 1;
        }
        return 0;
    });
    // Only assign the data to replicant if there is data
    if (data.length > 0) {
        highlightedMatchData.value = data;
    }
}

/**
 * Build the team data when given a MatchTeam from Battlefy
 * @param teamData data for a team in a match
 */
function teamDataBuilder(teamData: MatchTeam): Team {
    const teamReturnObject: Team = {
        id: teamData.team._id,
        name: teamData.team.name,
        logoUrl: teamData.team.persistentTeam?.logoUrl,
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

/**
 * Returns the matches with isMarkedLive as true for a list of Battlefy Stages
 * @param stages StageIDs of the stages to get highlighted matches from
 * @param getAllStages Get data for all stages
 */
async function getBattlefyMatches(stages?: Array<string>, getAllStages?: boolean): Promise<HighlightedMatch> {
    const requestUrl = `https://api.battlefy.com/tournaments/${tournamentData.value.meta.id}` +
        '?extend[stages][$query][deletedAt][$exists]=false' +
        '&extend[stages][matches]=1' +
        '&extend[stages][$opts][name]=1' +
        '&extend[stages][$opts][matches][$elemMatch][isMarkedLive]=true' +
        '&extend[stages.matches.top.team]=1' +
        '&extend[stages.matches.bottom.team]=1' +
        '&extend[stages][$opts][bracket]=1' +
        '&extend[stages.matches.top.team.persistentTeam]=1' +
        '&extend[stages.matches.bottom.team.persistentTeam]=1' +
        '&extend[stages.matches.top.team.players]=1' +
        '&extend[stages.matches.bottom.team.players]=1';

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

function mapBattlefyRoundData(stages: Stage[]): HighlightedMatch {
    const result: HighlightedMatch = [];

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
            const teamAData = teamDataBuilder(match.top);
            const teamBData = teamDataBuilder(match.bottom);

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

            const metaData = {
                id: match._id,
                stageName: stage.name,
                round: match.roundNumber,
                match: match.matchNumber,
                name: matchName,
                completionTime: 'None'
            };
            // If the completedAt exists then we add it to the metadata
            if (match.completedAt !== undefined) {
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
