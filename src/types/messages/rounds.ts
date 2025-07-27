export interface SetRoundRequest {
    teamAId: string;
    teamBId: string;
    matchId?: string;
    matchName: string;
}

export interface SetNextRoundRequest {
    teamAId: string;
    teamBId: string;
    roundId?: string;
    games?: {
        stage: string;
        mode: string;
        [k: string]: unknown;
    }[];
    name: string;
}
