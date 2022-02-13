import { GameData } from './gameData';
import { normalizeGameData } from './normalizeGameData';

export const splatoon3Data: GameData = normalizeGameData({
    stages: [
        'Museum d\'Alfonsino',
        'Scorch Gorge',
        'Eeltail Alley'
    ],
    modes: [
        'Turf War'
    ],
    colors: [
        {
            meta: {
                name: 'Splatoon 3 colors'
            },
            colors: [
                {
                    index: 0,
                    title: 'Blue vs Yellow',
                    clrA: '#5F3AE0',
                    clrB: '#EDED3D',
                    clrNeutral: '#FFFFFF',
                    isCustom: false
                }
            ]
        }
    ]
});
