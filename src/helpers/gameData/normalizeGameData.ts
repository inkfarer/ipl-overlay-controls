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
    }
};

const commonModeNames: {[key in Locale]: { 'Unknown Mode': string } } = {
    [Locale.EN]: {
        'Unknown Mode': 'Unknown Mode',
    },
    [Locale.DE]: {
        'Unknown Mode': 'Unbekannte Kampfart',
    }
};

export function normalizeGameData<S, M>(existingData: RawGameData<S, M>): GameData<S, M> {

    const data = cloneDeep(existingData) as GameData<S, M>;

    data.stages = Object.entries(data.stages).reduce((result, [key, value]) => {
        result[key as Locale] = {
            ...value,
            ...commonStageNames[key as Locale]
        };

        return result;
    }, {} as StageNameList<S>);

    data.modes = Object.entries(data.modes).reduce((result, [key, value]) => {
        result[key as Locale] = {
            ...value,
            ...commonModeNames[key as Locale]
        };

        return result;
    }, {} as StageModeList<M>);

    data.colors.push({
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
    });

    return data;
}
