import { SmashggEvent } from 'types/smashgg';

export interface ToggleTeamImageRequest {
    teamId: string;
    isVisible: boolean;
}

export interface GetSmashggEventRequest {
    eventId: number;
}

export interface GetTournamentDataResponse {
    id?: string
    events?: SmashggEvent[]
}
