export interface Player {
    name: string;
    [k: string]: unknown;
}

export interface Team {
    id: string;
    name: string;
    logoUrl?: string;
    showLogo: boolean;
    players: Player[];
    [k: string]: unknown;
}
