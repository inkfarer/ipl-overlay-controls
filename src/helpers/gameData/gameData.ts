import { ColorGroup } from '../../types/colors';
import { GameVersion } from '../../types/enums/gameVersion';
import { splatoon2Data, Splatoon2Modes, Splatoon2Stages } from './splatoon2Data';
import { splatoon3Data, Splatoon3Modes, Splatoon3Stages } from './splatoon3Data';
import { Locale } from '../../types/enums/Locale';

export interface RawGameData<S, M> {
    stages: {[locale in Locale]: {[stage in keyof S]: string } },
    stageImagePaths: {[stage in keyof S]: string },
    modes: {[locale in Locale]: {[mode in keyof M]: string } },
    colors: ColorGroup[]
}

export type StageNameList<S> = {
    [locale in Locale]: {
        [stage in keyof S]: string & { 'Unknown Stage': string, Counterpick: string }
    }
};

export type StageModeList<M> = {
    [locale in Locale]: {
        [mode in keyof M]: string & { 'Unknown Mode': string }
    }
};

export interface GameData<S, M> {
    stages: StageNameList<S>,
    stageImagePaths: {[stage in keyof S]: string },
    modes: StageModeList<M>,
    colors: ColorGroup[]
}

type StageTypeMap = { [GameVersion.SPLATOON_2]: Splatoon2Stages, [GameVersion.SPLATOON_3]: Splatoon3Stages };
type ModeTypeMap = { [GameVersion.SPLATOON_2]: Splatoon2Modes, [GameVersion.SPLATOON_3]: Splatoon3Modes };

export const perGameData: {[key in GameVersion]: GameData<StageTypeMap[key], ModeTypeMap[key]>} = {
    [GameVersion.SPLATOON_2]: splatoon2Data,
    [GameVersion.SPLATOON_3]: splatoon3Data
};
