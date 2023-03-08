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
    'Brinewater Springs': string
    'Flounder Heights': string
    'Um\'ami Ruins': string
    'Manta Maria': string
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
            'Wahoo World': 'Wahoo World',
            'Brinewater Springs': 'Brinewater Springs',
            'Flounder Heights': 'Flounder Heights',
            'Um\'ami Ruins': 'Um\'ami Ruins',
            'Manta Maria': 'Manta Maria'
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
            'Wahoo World': 'Flunder-Funpark',
            'Brinewater Springs': 'Kusaya-Quellen',
            'Flounder Heights': 'Schollensiedlung',
            'Um\'ami Ruins': 'Um\'ami-Ruinen',
            'Manta Maria': 'Manta Maria'
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
                name: 'Ranked Modes'
            },
            colors: [
                {
                    index: 0,
                    title: 'Turquoise vs Orange',
                    clrA: '#2ADBC6',
                    clrB: '#FA5A41',
                    clrNeutral: '#4445FF',
                    isCustom: false
                },
                {
                    index: 1,
                    title: 'Pink vs Green',
                    clrA: '#F753A1',
                    clrB: '#35CC2D',
                    clrNeutral: '#4A36FF',
                    isCustom: false
                },
                {
                    index: 2,
                    title: 'Gold vs Purple',
                    clrA: '#EBCC31',
                    clrB: '#A032DB',
                    clrNeutral: '#73DE35',
                    isCustom: false
                },
                {
                    index: 3,
                    title: 'Yellow vs Dark Blue',
                    clrA: '#EDD921',
                    clrB: '#461EE6',
                    clrNeutral: '#4445FF',
                    isCustom: false
                },
                {
                    index: 4,
                    title: 'Green vs Pink',
                    clrA: '#B3DE45',
                    clrB: '#D43BCA',
                    clrNeutral: '#FFC042',
                    isCustom: false
                },
                {
                    index: 5,
                    title: 'Orange vs Dark Blue',
                    clrA: '#FC7735',
                    clrB: '#4048DB',
                    clrNeutral: '#F8F755',
                    isCustom: false
                },
                {
                    index: 6,
                    title: 'Orange vs Purple',
                    clrA: '#F56522',
                    clrB: '#821CD6',
                    clrNeutral: '#CDFF45',
                    isCustom: false
                },
                {
                    index: 7,
                    title: 'Turquoise vs Pink',
                    clrA: '#2ADBC3',
                    clrB: '#E34984',
                    clrNeutral: '#7577FF',
                    isCustom: false
                },
                {
                    index: 8,
                    title: 'Yellow vs Purple',
                    clrA: '#EEFC58',
                    clrB: '#7635F0',
                    clrNeutral: '#54FDE8',
                    isCustom: false
                },
                {
                    index: 9,
                    title: 'Dark Blue vs Orange',
                    clrA: '#2C2CDB',
                    clrB: '#F29C33',
                    clrNeutral: '#FF67EE',
                    isCustom: false
                }
            ]
        }
    ]
});
