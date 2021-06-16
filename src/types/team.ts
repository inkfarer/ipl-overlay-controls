import { Player } from 'types/player';

export interface Team {
    id: string;
    name: string;
    logoUrl?: string;
    players: Player[];
}
