export interface Match{
    meta: {
        name: string;
        id: string;
        stageName?: string;
        completeTime?: string;
        round?: number;
        match?: number;
        [k: string]: any;
    };
    teamA: {
        id?: string;
        name?: string;
        logoUrl?: string;
        players?: {
            name?: string;
            [k: string]: any;
        }[];
        [k: string]: any;
    };
    teamB: {
        id?: string;
        name?: string;
        logoUrl?: string;
        players?: {
            name?: string;
            [k: string]: any;
        }[];
        [k: string]: any;
    };
    [k: string]: any;
}