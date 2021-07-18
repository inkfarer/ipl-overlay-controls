import { Team } from 'types/team';
import clone from 'clone';
import { TournamentData } from 'schemas';

export function getTeam(id: string, tournamentData: TournamentData, doClone = true): Team {
    const team = tournamentData.teams.filter(team => team.id === id)[0];
    return doClone ? clone(team) : team;
}
