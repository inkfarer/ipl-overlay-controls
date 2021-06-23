export interface Match{
    meta: {
        name: string;
        id: string;
        stageName?: string;
        completeTime?: string;
        round?: number;
        match?: number;
    };
    teamA: {
        id?: string;
        name?: string;
        logoUrl?: string;
        players?: {
            name?: string;
        }[];
    };
    teamB: {
        id?: string;
        name?: string;
        logoUrl?: string;
        players?: {
            name?: string;
        }[];
    };
}