import { PlayType } from '../enums/playType';

export interface UpdateRoundStoreRequest {
    id?: string;
    roundName?: string;
    type?: PlayType;
    games?: { stage: string, mode: string }[];
}

export interface UpdateRoundStoreResponse {
    id: string;
    round: {
        games: { stage: string, mode: string }[];
        meta: {
            name: string;
        }
    };
}

export interface RemoveRoundRequest {
    roundId: string;
}
