import cloneDeep from 'lodash/cloneDeep';
import { GameData } from './gameData';

export function normalizeGameData(existingData: GameData): GameData {
    const data = cloneDeep(existingData);
    data.stages.push('Unknown Stage', 'Counterpick');
    data.stages.sort();

    data.modes.push('Unknown Mode');
    data.modes.sort();

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
