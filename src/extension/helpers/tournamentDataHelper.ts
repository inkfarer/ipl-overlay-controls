import { Team } from 'types/team';
import clone from 'clone';
import { TournamentData } from 'schemas';

export function getTeam(id: string, tournamentData: TournamentData): Team {
    return clone(tournamentData.teams.filter(team => team.id === id)[0]);
}
