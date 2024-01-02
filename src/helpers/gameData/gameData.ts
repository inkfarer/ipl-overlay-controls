import { ColorGroup, ColorInfo } from '../../types/colors';
import { GameVersion } from '../../types/enums/gameVersion';
import { splatoon2Data, Splatoon2Modes, Splatoon2Stages } from './splatoon2Data';
import { splatoon3Data, Splatoon3Modes, Splatoon3Stages } from './splatoon3Data';
import { Locale } from '../../types/enums/Locale';

interface RawColorGroup {
    meta: { name: string; };
    colors: Omit<ColorInfo, 'isCustom'>[];
}

export interface RawGameData<S extends readonly string[], M extends readonly string[]> {
    stages: {[locale in Locale]: {[stage in S[number]]: string } },
    stageImagePaths: {[stage in S[number]]: string },
    modes: {[locale in Locale]: {[mode in M[number]]: string } },
    colors: RawColorGroup[]
}

export type StageNameList<S extends readonly string[]> = {
    [locale in Locale]: { [stage in S[number]]: string } & { 'Unknown Stage': string, Counterpick: string }
};

export type StageModeList<M extends readonly string[]> = {
    [locale in Locale]: { [mode in M[number]]: string } & { 'Unknown Mode': string }
};

export interface GameData<S extends readonly string[], M extends readonly string[]> {
    stages: StageNameList<S>,
    stageImagePaths: {[stage in S[number]]: string },
    modes: StageModeList<M>,
    colors: ColorGroup[]
}

type StageTypeMap = {
    [GameVersion.SPLATOON_2]: typeof Splatoon2Stages,
    [GameVersion.SPLATOON_3]: typeof Splatoon3Stages
};
type ModeTypeMap = {
    [GameVersion.SPLATOON_2]: typeof Splatoon2Modes,
    [GameVersion.SPLATOON_3]: typeof Splatoon3Modes
};

export const perGameData: {[key in GameVersion]: GameData<StageTypeMap[key], ModeTypeMap[key]>} = {
    [GameVersion.SPLATOON_2]: splatoon2Data,
    [GameVersion.SPLATOON_3]: splatoon3Data
};
