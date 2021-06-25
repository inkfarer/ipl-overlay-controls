import { Team } from 'types/team';

export interface Match {
    meta: {
        name: string;
        id: string;
        stageName?: string;
        completeTime?: string;
        round?: number;
        match?: number;
    };
    teamA: Team;
    teamB: Team;
}
