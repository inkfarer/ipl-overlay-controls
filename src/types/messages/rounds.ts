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
    name: string;
}
