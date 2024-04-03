import cloneDeep from 'lodash/cloneDeep';
import { GameData, RawGameData, StageModeList, StageNameList } from './gameData';
import { Locale } from '../../types/enums/Locale';

const commonStageNames: {[key in Locale]: { 'Unknown Stage': string, 'Counterpick': string } } = {
    [Locale.EN]: {
        'Unknown Stage': 'Unknown Stage',
        Counterpick: 'Counterpick'
    },
    [Locale.DE]: {
        'Unknown Stage': 'Unbekannte Arena',
        Counterpick: 'Counterpick'
    },
    [Locale.EU_FR]: {
        'Unknown Stage': 'Stage à déterminer',
        Counterpick: 'Counterpick'
    },
    [Locale.JA]: {
        'Unknown Stage': 'ステージ未選択',
        Counterpick: 'カウンターピック'
    }
};

const commonModeNames: {[key in Locale]: { 'Unknown Mode': string } } = {
    [Locale.EN]: {
        'Unknown Mode': 'Unknown Mode',
    },
    [Locale.DE]: {
        'Unknown Mode': 'Unbekannte Kampfart',
    },
    [Locale.EU_FR]: {
        'Unknown Mode': 'Mode à déterminer',
    },
    [Locale.JA]: {
        'Unknown Mode': 'ルール未選択'
    }
};

export function normalizeGameData<S extends readonly string[], M extends readonly string[]>(
    existingData: RawGameData<S, M>
): GameData<S, M> {
    const data = cloneDeep(existingData);

    return {
        ...data,
        stages: Object.entries(data.stages).reduce((result, [key, value]) => {
            result[key as Locale] = {
                ...value,
                ...commonStageNames[key as Locale]
            };

            return result;
        }, {} as StageNameList<S>),
        modes: Object.entries(data.modes).reduce((result, [key, value]) => {
            result[key as Locale] = {
                ...value,
                ...commonModeNames[key as Locale]
            };

            return result;
        }, {} as StageModeList<M>),
        colors: [
            ...data.colors.map(colorGroup => ({
                ...colorGroup,
                colors: colorGroup.colors.map(color => ({ ...color, isCustom: false }))
            })),
            {
                meta: {
                    name: 'Custom Color'
                },
                colors: [
                    {
                        index: 0,
                        title: 'Custom Color',
                        clrA: '#000000',
                        clrB: '#FFFFFF',
                        clrNeutral: '#818181',
                        isCustom: true
                    }
                ]
            }
        ]
    };
}
