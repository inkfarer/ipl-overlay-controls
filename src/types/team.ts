export interface Player {
    name: string;
}

export interface Team {
    id: string;
    name: string;
    logoUrl?: string;
    showLogo: boolean;
    players: Player[];
}
