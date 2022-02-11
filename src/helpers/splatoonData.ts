import { ColorGroup } from '../types/colors';

export const splatStages = [
    'Ancho-V Games',
    'Arowana Mall',
    'Blackbelly Skatepark',
    'Camp Triggerfish',
    'Counterpick',
    'Goby Arena',
    'Humpback Pump Track',
    'Inkblot Art Academy',
    'Kelp Dome',
    'MakoMart',
    'Manta Maria',
    'Moray Towers',
    'Musselforge Fitness',
    'New Albacore Hotel',
    'Piranha Pit',
    'Port Mackerel',
    'Shellendorf Institute',
    'Shifty Station',
    'Snapper Canal',
    'Starfish Mainstage',
    'Sturgeon Shipyard',
    'The Reef',
    'Wahoo World',
    'Walleye Warehouse',
    'Skipper Pavilion',
    'Unknown Stage'
];
splatStages.sort();

export const splatModes = [
    'Clam Blitz',
    'Tower Control',
    'Rainmaker',
    'Splat Zones',
    'Turf War',
    'Unknown Mode'
];
splatModes.sort();

export const colors: ColorGroup[] = [
    {
        meta: {
            name: 'Ranked Modes'
        },
        colors: [
            {
                index: 0,
                title: 'Green vs Grape',
                clrA: '#37FC00',
                clrB: '#7D28FC',
                clrNeutral: '#F4067E',
                isCustom: false
            },
            {
                index: 1,
                title: 'Green vs Magenta',
                clrA: '#04D976',
                clrB: '#D600AB',
                clrNeutral: '#D2E500',
                isCustom: false
            },
            {
                index: 2,
                title: 'Turquoise vs Orange',
                clrA: '#10E38F',
                clrB: '#FB7B08',
                clrNeutral: '#6912CD',
                isCustom: false
            },
            {
                index: 3,
                title: 'Mustard vs Purple',
                clrA: '#FF9E03',
                clrB: '#B909E0',
                clrNeutral: '#08C66B',
                isCustom: false
            },
            {
                index: 4,
                title: 'Dark Blue vs Green',
                clrA: '#2F27CC',
                clrB: '#37FC00',
                clrNeutral: '#EA01B7',
                isCustom: false
            },
            {
                index: 5,
                title: 'Purple vs Green',
                clrA: '#B909E0',
                clrB: '#37FC00',
                clrNeutral: '#F87604',
                isCustom: false
            },
            {
                index: 6,
                title: 'Yellow vs Blue',
                clrA: '#FEF232',
                clrB: '#2ED2FE',
                clrNeutral: '#FD5600',
                isCustom: false
            }
        ]
    },
    {
        meta: {
            name: 'Turf War'
        },
        colors: [
            {
                index: 0,
                title: 'Yellow vs Purple',
                clrA: '#D1E004',
                clrB: '#960CB2',
                clrNeutral: '#0EB962',
                isCustom: false
            },
            {
                index: 1,
                title: 'Pink vs Blue',
                clrA: '#E61077',
                clrB: '#361CB8',
                clrNeutral: '#24C133',
                isCustom: false
            },
            {
                index: 2,
                title: 'Pink vs Yellow',
                clrA: '#ED0C6A',
                clrB: '#D5E802',
                clrNeutral: '#08C24D',
                isCustom: false
            },
            {
                index: 3,
                title: 'Purple vs Turquoise',
                clrA: '#6B10CC',
                clrB: '#08CC81',
                clrNeutral: '#EB246D',
                isCustom: false
            },
            {
                index: 4,
                title: 'Pink vs Light Blue',
                clrA: '#E30960',
                clrB: '#02ADCF',
                clrNeutral: '#DDE713',
                isCustom: false
            },
            {
                index: 5,
                title: 'Purple vs Orange',
                clrA: '#5617C2',
                clrB: '#FF5F03',
                clrNeutral: '#ACE81E',
                isCustom: false
            },
            {
                index: 6,
                title: 'Pink vs Green',
                clrA: '#E60572',
                clrB: '#1BBF0F',
                clrNeutral: '#CCE50C',
                isCustom: false
            }
        ]
    },
    {
        meta: {
            name: 'Color Lock'
        },
        colors: [
            {
                index: 0,
                title: 'Yellow vs Blue (Color Lock)',
                clrA: '#FEF232',
                clrB: '#2F27CC',
                clrNeutral: '#DC1589',
                isCustom: false
            }
        ]
    },
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
];
