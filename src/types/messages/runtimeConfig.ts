import { GameVersion } from '../enums/gameVersion';

export interface SetGameVersionMessage {
    version: GameVersion
}

export type SetGameVersionResponse = { incompatibleBundles: Array<string> } | null
