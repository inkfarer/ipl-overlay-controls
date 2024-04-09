import { Stage } from '../../types/battlefyTournamentData';
import { BracketType, BracketTypeHelper } from '../../../types/enums/bracketType';
import isEmpty from 'lodash/isEmpty';
import { MatchTeam } from '../../types/battlefyStage';
import { HighlightedMatches } from '../../../types/schemas';
import { HighlightedMatchMetadata } from '../../../types/highlightedMatch';
import { Team } from '../../../types/team';
import { PlayType } from '../../../types/enums/playType';
import { PlayTypeHelper } from '../../../helpers/enums/playTypeHelper';
import { teamExists } from '../tournamentDataHelper';
import i18next from 'i18next';

export function mapBattlefyStagesToTournamentData(stages: Stage[]):
    { name: string; id: string; type: BracketType, playType: PlayType}[] {
    return stages.map(stage => ({
        name: stage.name,
        id: stage._id,
        type: BracketTypeHelper.fromBattlefy(stage.bracket.type, stage.bracket.style),
        playType: PlayTypeHelper.fromBattlefySeriesStyle(stage.bracket.seriesStyle)
    }));
}

export function mapBattlefyStagesToHighlightedMatches(stages: Stage[]): HighlightedMatches {
    const result: HighlightedMatches = [];

    const validBracketStages = stages.filter(stage => {
        return ['swiss', 'elimination', 'roundrobin'].includes(stage.bracket.type);
    });

    for (let i = 0; i < validBracketStages.length; i++) {
        const stage = validBracketStages[i];

        const liveMatches = stage.matches.filter(match => match.isMarkedLive === true);

        for (let j = 0; j < liveMatches.length; j++) {
            const match = liveMatches[j];
            if (!match.top.team || !match.bottom.team) continue;

            // Build Team info
            const teamAData = mapBattlefyTeamData(match.top);
            const teamBData = mapBattlefyTeamData(match.bottom);

            if (!teamExists(teamAData.id) || !teamExists(teamBData.id)) continue;

            // Build MetaData for match
            let matchNumber: string;
            if (match.matchType && ['loser', 'winner'].includes(match.matchType)) {
                if (match.matchType === 'loser') {
                    matchNumber = `L${match.matchNumber}`;
                } else if (match.matchType === 'winner') {
                    matchNumber = `C${match.matchNumber}`;
                }
            } else {
                matchNumber = String(match.matchNumber);
            }
            const matchName = i18next.t('battlefyClient.matchName', {
                roundNumber: match.roundNumber,
                matchNumber
            });

            const metaData: HighlightedMatchMetadata = {
                id: match._id,
                stageName: stage.name,
                round: match.roundNumber,
                match: match.matchNumber,
                name: matchName,
                shortName: i18next.t('battlefyClient.shortMatchName', { stageName: stage.name, roundNumber: match.roundNumber }),
                playType: PlayTypeHelper.fromBattlefySeriesStyle(stage.bracket.seriesStyle)
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
