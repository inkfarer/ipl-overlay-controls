import { GameVersion } from '../enums/gameVersion';

export interface SetGameVersionMessage {
    version: GameVersion
}

export interface SetGameVersionResponse {
    incompatibleBundles: Array<string>
}
