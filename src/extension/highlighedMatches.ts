/*
This file handles getting highlighted matches from different services
 */
import axios from 'axios';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import * as nodecgContext from './util/nodecg';
import { HighlightedMatch } from 'schemas';
import { Team } from 'types/team';
import { BattlefyStage } from './types/battlefyStages';

const nodecg = nodecgContext.get();

const highlightedMatchData = nodecg.Replicant<HighlightedMatch>('highlighedMatches');

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
                    updateMatchesReplicants(data);
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
 * Assigns data to highlighedMatch replicant
 * @param data Data handed back from data provider
 */
export function updateMatchesReplicants(data: HighlightedMatch): void{
    console.log(data);
    // Only assign the data to replicant if there is data
    if(data.length > 0){
        highlightedMatchData.value = data;
    }
}

/**
 * Returns the matches with isMarkedLive as true for a list of Battlefy Stages
 * @param stages StageID of the stages to get highlighted matches from
 */
async function getBattlefyMatches(stages: Array<string>): Promise<HighlightedMatch> {

    return new Promise((resolve, reject) => {
        const matchData: HighlightedMatch = [];
        for(let i = 0; i < stages.length; i++){
            // eslint-disable-next-line max-len
            const requestURL = `https://api.battlefy.com/stages/${stages[i]}?extend%5Bmatches%5D%5Btop.team%5D%5Bplayers%5D%5Buser%5D=true&extend%5Bmatches%5D%5Btop.team%5D%5BpersistentTeam%5D=true&extend%5Bmatches%5D%5Bbottom.team%5D%5Bplayers%5D%5Buser%5D=true&extend%5Bmatches%5D%5Bbottom.team%5D%5BpersistentTeam%5D=true&extend%5Bgroups%5D%5Bteams%5D=true&extend%5Bgroups%5D%5Bmatches%5D%5Btop.team%5D%5Bplayers%5D%5Buser%5D=true&extend%5Bgroups%5D%5Bmatches%5D%5Btop.team%5D%5BpersistentTeam%5D=true&extend%5Bgroups%5D%5Bmatches%5D%5Bbottom.team%5D%5Bplayers%5D%5Buser%5D=true&extend%5Bgroups%5D%5Bmatches%5D%5Bbottom.team%5D%5BpersistentTeam%5D=true`;
            axios.get(requestURL).then(async (response) => {
                const { data } = response;
                // If there's an error, reject
                if (data.error) {
                    reject(data.error);
                    return;
                }
                const battlefyData: BattlefyStage = data[0];
                // Make sure the type of bracket is supported and tested (i.e. Not Ladder)
                if(['swiss', 'elimination'].includes(battlefyData.bracket.type)){
                    // For each match
                    for (let i = 0; i < battlefyData.matches.length; i++) {
                        const match = battlefyData.matches[i];
                        // If match is marked on Battlefy
                        if ((match.isMarkedLive !== undefined) && (match.isMarkedLive === true)) {
                            console.log(`true: ${match.matchNumber}`);
                            // Build TeamA's info
                            const teamAData: Team = {
                                id: match.top.team.persistentTeamID,
                                name: match.top.team.name,
                                logoUrl: match.top.team.persistentTeam.logoUrl,
                                players: []
                            };
                            for(let x = 0; x < match.top.team.players.length; x++){
                                const playerValue = match.top.team.players[x];
                                const playerInfo = {
                                    name: playerValue.inGameName,
                                    username: playerValue.user.username
                                };
                                teamAData.players.push(playerInfo);
                            }
                            // Build TeamB's info
                            const teamBData: Team = {
                                id: match.bottom.team.persistentTeamID,
                                name: match.bottom.team.name,
                                logoUrl: match.bottom.team.persistentTeam.logoUrl,
                                players: []
                            };
                            for(let x = 0; x < match.bottom.team.players.length; x++){
                                const playerValue = match.bottom.team.players[x];
                                const playerInfo = {
                                    name: playerValue.inGameName,
                                    username: playerValue.user.username
                                };
                                teamBData.players.push(playerInfo);
                            }
                            // Build MetaData for match
                            const metaData = {
                                id: match._id,
                                stageName: battlefyData.name,
                                round: match.roundNumber,
                                match: match.matchNumber,
                                name: `Round ${match.roundNumber} Match ${match.roundNumber}`,
                                completeTime: 'None'
                            };
                            // If the completedAt exists then we add it to the metadata
                            if(match.completedAt !== undefined){
                                metaData.completeTime = match.completedAt;
                            }
                            matchData.push({  // Push match into array
                                meta: metaData,
                                teamA: teamAData,
                                teamB: teamBData
                            });
                        }
                    }
                    console.log(`in progress: ${matchData}`);
                }
            }).catch(err => {
                reject(err);
            });
        }
        console.log(`matchData: ${matchData}`);
        resolve(matchData);
    });
}