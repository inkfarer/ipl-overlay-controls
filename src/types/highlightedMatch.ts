import { PlayType } from './enums/playType';

export interface HighlightedMatchMetaData {
    id: string;
    stageName: string;
    round: number;
    match: number;
    name: string;
    completionTime?: string;
    playType?: PlayType;
}
