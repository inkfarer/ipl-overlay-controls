import { PlayType } from './enums/playType';

export interface HighlightedMatchMetadata {
    id: string;
    stageName: string;
    round: number;
    match: number;
    name: string;
    shortName: string;
    completionTime?: string;
    playType?: PlayType;
}
