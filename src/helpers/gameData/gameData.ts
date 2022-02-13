import { ColorGroup } from '../../types/colors';
import { GameVersion } from '../../types/enums/gameVersion';
import { splatoon2Data } from './splatoon2Data';
import { splatoon3Data } from './splatoon3Data';

export interface GameData {
    stages: Array<string>
    modes: Array<string>
    colors: ColorGroup[]
}

export const perGameData: {[key in GameVersion]: GameData} = {
    [GameVersion.SPLATOON_2]: splatoon2Data,
    [GameVersion.SPLATOON_3]: splatoon3Data
};
