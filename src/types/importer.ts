export interface ImporterRound {
    name: string;
    maps?: ImporterGame[];
    games?: ImporterGame[];
}

interface ImporterGame {
    stage?: string;
    map?: string;
    mode: string;
}
