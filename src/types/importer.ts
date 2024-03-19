import { PlayType } from './enums/playType';

export interface ImporterRound {
    name: string;
    type?: PlayType;
    maps?: ImporterGame[];
    games?: ImporterGame[];
}

interface ImporterGame {
    stage?: string;
    map?: string;
    mode: string;
}

export interface MapsIplabsRound {
    name: string;
    playStyle: 'playAll' | 'bestOf';
    games: MapsIplabsGame[];
}

export type MapsIplabsGame = 'counterpick' | {
    map: number | string;
    mode: string;
}