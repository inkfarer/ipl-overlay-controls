import { SmashggEvent } from 'types/smashgg';
import { TournamentDataSource } from '../enums/tournamentDataSource';

export interface ToggleTeamImageRequest {
    teamId: string;
    isVisible: boolean;
}

export interface GetSmashggEventRequest {
    eventId: number;
}

export interface GetTournamentDataRequest {
    id: string
    method: TournamentDataSource
}

export interface GetTournamentDataResponse {
    id?: string
    events?: SmashggEvent[]
}
