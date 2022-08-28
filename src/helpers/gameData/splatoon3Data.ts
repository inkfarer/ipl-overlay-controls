import { GameData } from './gameData';
import { normalizeGameData } from './normalizeGameData';
import { Locale } from '../../types/enums/Locale';

export interface Splatoon3Stages {
    'Museum d\'Alfonsino': string
    'Scorch Gorge': string
    'Eeltail Alley': string
    'Hagglefish Market': string
    'Undertow Spillway': string
    'Mincemeat Metalworks': string
    'Hammerhead Bridge': string
    'Mahi-Mahi Resort': string
    'Inkblot Art Academy': string
    'Sturgeon Shipyard': string
    MakoMart: string
    'Wahoo World': string
}

export interface Splatoon3Modes {
    'Clam Blitz': string
    'Tower Control': string
    'Rainmaker': string
    'Splat Zones': string
    'Turf War': string
}

export const splatoon3Data: GameData<Splatoon3Stages, Splatoon3Modes> = normalizeGameData({
    stages: {
        [Locale.EN]: {
            'Museum d\'Alfonsino': 'Museum d\'Alfonsino',
            'Scorch Gorge': 'Scorch Gorge',
            'Eeltail Alley': 'Eeltail Alley',
            'Hagglefish Market': 'Hagglefish Market',
            'Undertow Spillway': 'Undertow Spillway',
            'Mincemeat Metalworks': 'Mincemeat Metalworks',
            'Hammerhead Bridge': 'Hammerhead Bridge',
            'Mahi-Mahi Resort': 'Mahi-Mahi Resort',
            'Inkblot Art Academy': 'Inkblot Art Academy',
            'Sturgeon Shipyard': 'Sturgeon Shipyard',
            MakoMart: 'MakoMart',
            'Wahoo World': 'Wahoo World'
        },
        [Locale.DE]: {
            'Museum d\'Alfonsino': 'Pinakoithek',
            'Scorch Gorge': 'Sengkluft',
            'Eeltail Alley': 'Streifenaal-Straße',
            'Hagglefish Market': 'Schnapperchen-Basar',
            'Undertow Spillway': 'Schwertmuschel-Reservoir',
            'Mincemeat Metalworks': 'Aalstahl-Metallwerk',
            'Hammerhead Bridge': 'Makrelenbrücke',
            'Mahi-Mahi Resort': 'Mahi-Mahi-Resort',
            'Inkblot Art Academy': 'Perlmutt-Akademie',
            'Sturgeon Shipyard': 'Störwerft',
            MakoMart: 'Cetacea-Markt',
            'Wahoo World': 'Flunder-Funpark'
        }
    },
    modes: {
        [Locale.EN]: {
            'Clam Blitz': 'Clam Blitz',
            'Tower Control': 'Tower Control',
            Rainmaker: 'Rainmaker',
            'Splat Zones': 'Splat Zones',
            'Turf War': 'Turf War'
        },
        [Locale.DE]: {
            'Clam Blitz': 'Muschelchaos',
            'Tower Control': 'Turmkommando',
            Rainmaker: 'Operation Goldfisch',
            'Splat Zones': 'Herrschaft',
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
