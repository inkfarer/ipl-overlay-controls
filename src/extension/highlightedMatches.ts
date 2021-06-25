/*
This file handles getting highlighted matches from different services
 */
import axios, { AxiosResponse } from 'axios';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import * as nodecgContext from './util/nodecg';
import { HighlightedMatch } from 'schemas';
import { Team } from 'types/team';
import { BattlefyStage, Match, MatchTeam } from './types/battlefyStage';
const nodecg = nodecgContext.get();

const highlightedMatchData = nodecg.Replicant<HighlightedMatch>('highlightedMatches');

/**
 * Handles the listener for when request is triggered
 */
nodecg.listenFor('getHighlightedMatches', async (data, ack: UnhandledListenForCb) => {
    if (!data.stages || !data.provider) {
        ack(new Error('Missing arguments.'), null);
        return;
    }
    switch (data.provider) {
        case 'Battlefy':
            getBattlefyMatches(data.stages)
                .then(data => {
                    updateMatchReplicant(data);
                    ack(null, data);
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
    // Only assign the data to replicant if there is data
    if (data.length > 0) {
        highlightedMatchData.value = data;
    }
}

/**
 * Build the team data when given a MatchTeam from Battlefy
 * @param teamData data for a team in a match
 */
function teamDataBuilder(teamData: MatchTeam): Team{
    const teamReturnObject: Team = {
        id: teamData.team._id,
        name: teamData.team.name,
        logoUrl: teamData.team.persistentTeam.logoUrl,
        players: []
    };
    for (let x = 0; x < teamData.team.players.length; x++) {
        const playerValue = teamData.team.players[x];
        const playerInfo = {
            name: playerValue.inGameName,
            username: playerValue.user?.username
        };
        teamReturnObject.players.push(playerInfo);
    }
    return teamReturnObject;
}

/**
 * Returns the matches with isMarkedLive as true for a list of Battlefy Stages
 * @param stages StageID of the stages to get highlighted matches from
 */
async function getBattlefyMatches(stages: Array<string>): Promise<HighlightedMatch> {
    const matchData: HighlightedMatch = [];
    const requestPromises: Promise<AxiosResponse>[] = [];
    for (let i = 0; i < stages.length; i++) {
        // eslint-disable-next-line max-len
        const requestURL = `https://api.battlefy.com/stages/${stages[i]}?extend%5Bmatches%5D%5Btop.team%5D%5Bplayers%5D%5Buser%5D=true&extend%5Bmatches%5D%5Btop.team%5D%5BpersistentTeam%5D=true&extend%5Bmatches%5D%5Bbottom.team%5D%5Bplayers%5D%5Buser%5D=true&extend%5Bmatches%5D%5Bbottom.team%5D%5BpersistentTeam%5D=true&extend%5Bgroups%5D%5Bteams%5D=true&extend%5Bgroups%5D%5Bmatches%5D%5Btop.team%5D%5Bplayers%5D%5Buser%5D=true&extend%5Bgroups%5D%5Bmatches%5D%5Btop.team%5D%5BpersistentTeam%5D=true&extend%5Bgroups%5D%5Bmatches%5D%5Bbottom.team%5D%5Bplayers%5D%5Buser%5D=true&extend%5Bgroups%5D%5Bmatches%5D%5Bbottom.team%5D%5BpersistentTeam%5D=true`;

        requestPromises.push(axios.get(requestURL));
    }

    const requests = await Promise.all(requestPromises);

    for (let i = 0; i < requests.length; i++) {
        const response = requests[i];
        const { data } = response;
        // If there's an error, reject
        if (data.error) {
            throw new Error(`Got error from Battlefy: ${data.error}`);
        }
        const battlefyData: BattlefyStage = data[0];
        // Make sure the type of bracket is supported and tested (i.e. Not Ladder)
        if (['swiss', 'elimination', 'roundrobin'].includes(battlefyData.bracket.type)) {
            // For each match
            for (let i = 0; i < battlefyData.matches.length; i++) {
                const match: Match= battlefyData.matches[i];
                // If match is marked on Battlefy
                if ((match.isMarkedLive !== undefined) && (match.isMarkedLive === true)) {

                    // Build Team info
                    const teamAData = teamDataBuilder(match.top);
                    const teamBData = teamDataBuilder(match.bottom);
                    // Build MetaData for match
                    const metaData = {
                        id: match._id,
                        stageName: battlefyData.name,
                        round: match.roundNumber,
                        match: match.matchNumber,
                        name: `Round ${match.roundNumber} Match ${match.matchNumber}`,
                        completionTime: 'None'
                    };
                    // If the completedAt exists then we add it to the metadata
                    if (match.completedAt !== undefined) {
                        metaData.completionTime = match.completedAt;
                    }
                    matchData.push({  // Push match into array
                        meta: metaData,
                        teamA: teamAData,
                        teamB: teamBData
                    });
                }
            }
        }
    }
    return matchData;
}
