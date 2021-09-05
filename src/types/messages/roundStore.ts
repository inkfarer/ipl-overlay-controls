export interface UpdateRoundStoreRequest {
    id: string;
    roundName: string;
    games: { stage: string, mode: string }[];
}

export interface RemoveRoundRequest {
    roundId: string;
}
