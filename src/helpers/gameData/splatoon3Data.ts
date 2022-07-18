import { GameData } from './gameData';
import { normalizeGameData } from './normalizeGameData';
import { Locale } from '../../types/enums/Locale';

export interface Splatoon3Stages {
    'Museum d\'Alfonsino': string
    'Scorch Gorge': string
    'Eeltail Alley': string
}

export interface Splatoon3Modes {
    'Turf War': string
}

export const splatoon3Data: GameData<Splatoon3Stages, Splatoon3Modes> = normalizeGameData({
    stages: {
        [Locale.EN]: {
            'Museum d\'Alfonsino': 'Museum d\'Alfonsino',
            'Scorch Gorge': 'Scorch Gorge',
            'Eeltail Alley': 'Eeltail Alley'
        },
        [Locale.DE]: {
            'Museum d\'Alfonsino': 'Pinakoithek',
            'Scorch Gorge': 'Sengkluft',
            'Eeltail Alley': 'Streifenaal-Straße'
        }
    },
    modes: {
        [Locale.EN]: {
            'Turf War': 'Turf War'
        },
        [Locale.DE]: {
            'Turf War': 'Revierkampf'
        }
    },
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
