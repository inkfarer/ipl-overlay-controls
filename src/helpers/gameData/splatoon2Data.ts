import { GameData } from './gameData';
import { normalizeGameData } from './normalizeGameData';
import { Locale } from '../../types/enums/Locale';

export interface Splatoon2Stages {
    'Ancho-V Games': string
    'Arowana Mall': string
    'Blackbelly Skatepark': string
    'Camp Triggerfish': string
    'Goby Arena': string
    'Humpback Pump Track': string
    'Inkblot Art Academy': string
    'Kelp Dome': string
    'MakoMart': string
    'Manta Maria': string
    'Moray Towers': string
    'Musselforge Fitness': string
    'New Albacore Hotel': string
    'Piranha Pit': string
    'Port Mackerel': string
    'Shellendorf Institute': string
    'Shifty Station': string
    'Snapper Canal': string
    'Starfish Mainstage': string
    'Sturgeon Shipyard': string
    'The Reef': string
    'Wahoo World': string
    'Walleye Warehouse': string
    'Skipper Pavilion': string
}

export interface Splatoon2Modes {
    'Clam Blitz': string
    'Tower Control': string
    'Rainmaker': string
    'Splat Zones': string
    'Turf War': string
}

export const splatoon2Data: GameData<Splatoon2Stages, Splatoon2Modes> = normalizeGameData({
    stages: {
        [Locale.EN]: {
            'Ancho-V Games': 'Ancho-V Games',
            'Arowana Mall': 'Arowana Mall',
            'Blackbelly Skatepark': 'Blackbelly Skatepark',
            'Camp Triggerfish': 'Camp Triggerfish',
            'Goby Arena': 'Goby Arena',
            'Humpback Pump Track': 'Humpback Pump Track',
            'Inkblot Art Academy': 'Inkblot Art Academy',
            'Kelp Dome': 'Kelp Dome',
            MakoMart: 'MakoMart',
            'Manta Maria': 'Manta Maria',
            'Moray Towers': 'Moray Towers',
            'Musselforge Fitness': 'Musselforge Fitness',
            'New Albacore Hotel': 'New Albacore Hotel',
            'Piranha Pit': 'Piranha Pit',
            'Port Mackerel': 'Port Mackerel',
            'Shellendorf Institute': 'Shellendorf Institute',
            'Shifty Station': 'Shifty Station',
            'Snapper Canal': 'Snapper Canal',
            'Starfish Mainstage': 'Starfish Mainstage',
            'Sturgeon Shipyard': 'Sturgeon Shipyard',
            'The Reef': 'The Reef',
            'Wahoo World': 'Wahoo World',
            'Walleye Warehouse': 'Walleye Warehouse',
            'Skipper Pavilion': 'Skipper Pavilion'
        },
        [Locale.DE]: {
            'Ancho-V Games': 'Anchobit Games HQ',
            'Arowana Mall': 'Arowana Center',
            'Blackbelly Skatepark': 'Punkasius-Skatepark',
            'Camp Triggerfish': 'Camp Schützenfisch',
            'Goby Arena': 'Backfisch-Stadion',
            'Humpback Pump Track': 'Buckelwal-Piste',
            'Inkblot Art Academy': 'Perlmutt-Akademie',
            'Kelp Dome': 'Tümmlerkuppel',
            MakoMart: 'Cetacea-Markt',
            'Manta Maria': 'Manta Maria',
            'Moray Towers': 'Muränentürme',
            'Musselforge Fitness': 'Molluskelbude',
            'New Albacore Hotel': 'Hotel Neothun',
            'Piranha Pit': 'Steinköhler-Grube',
            'Port Mackerel': 'Heilbutt-Hafen',
            'Shellendorf Institute': 'Abyssal-Museum',
            'Shifty Station': 'Wandelzone',
            'Snapper Canal': 'Grätenkanal',
            'Starfish Mainstage': 'Seeigel-Rockbühne',
            'Sturgeon Shipyard': 'Störwerft',
            'The Reef': 'Korallenviertel',
            'Wahoo World': 'Flunder-Funpark',
            'Walleye Warehouse': 'Kofferfisch-Lager',
            'Skipper Pavilion': 'Grundel-Pavillon'
        },
        [Locale.EU_FR]: {
            'Ancho-V Games': 'Tentatec Studio',
            'Arowana Mall': 'Centre Arowana',
            'Blackbelly Skatepark': 'Skatepark Mako',
            'Camp Triggerfish': 'Hippo-Camping',
            'Goby Arena': 'Stade Bernique',
            'Humpback Pump Track': 'Piste Méroule',
            'Inkblot Art Academy': 'Institut Calam\'arts',
            'Kelp Dome': 'Serre Goémon',
            MakoMart: 'Supermarché Cétacé',
            'Manta Maria': 'Manta Maria',
            'Moray Towers': 'Tours Girelle',
            'Musselforge Fitness': 'Gymnase Ancrage',
            'New Albacore Hotel': 'Hôtel Atoll',
            'Piranha Pit': 'Carrière Caviar',
            'Port Mackerel': 'Docks Haddock',
            'Shellendorf Institute': 'Galerie des abysses',
            'Shifty Station': 'Plateforme polymorphe',
            'Snapper Canal': 'Canalamar',
            'Starfish Mainstage': 'Scène Sirène',
            'Sturgeon Shipyard': 'Chantier Narval',
            'The Reef': 'Allées salées',
            'Wahoo World': 'Parc Carapince',
            'Walleye Warehouse': 'Encrepôt',
            'Skipper Pavilion': 'Lagune aux gobies'
        }
    },
    stageImagePaths: {
        'Ancho-V Games': 'splatoon2/S2_Stage_Ancho-V_Games.webp',
        'Arowana Mall': 'splatoon2/S2_Stage_Arowana_Mall.webp',
        'Blackbelly Skatepark': 'splatoon2/S2_Stage_Blackbelly_Skatepark.webp',
        'Camp Triggerfish': 'splatoon2/S2_Stage_Camp_Triggerfish.webp',
        'Goby Arena': 'splatoon2/S2_Stage_Goby_Arena.webp',
        'Humpback Pump Track': 'splatoon2/S2_Stage_Humpback_Pump_Track.webp',
        'Inkblot Art Academy': 'splatoon2/S2_Stage_Inkblot_Art_Academy.webp',
        'Kelp Dome': 'splatoon2/S2_Stage_Kelp_Dome.webp',
        MakoMart: 'splatoon2/S2_Stage_MakoMart.webp',
        'Manta Maria': 'splatoon2/S2_Stage_Manta_Maria.webp',
        'Moray Towers': 'splatoon2/S2_Stage_Moray_Towers.webp',
        'Musselforge Fitness': 'splatoon2/S2_Stage_Musselforge_Fitness.webp',
        'New Albacore Hotel': 'splatoon2/S2_Stage_New_Albacore_Hotel.webp',
        'Piranha Pit': 'splatoon2/S2_Stage_Piranha_Pit.webp',
        'Port Mackerel': 'splatoon2/S2_Stage_Port_Mackerel.webp',
        'Shellendorf Institute': 'splatoon2/S2_Stage_Shellendorf_Institute.webp',
        'Shifty Station': 'splatoon2/S2_Stage_Shifty_Station.webp',
        'Snapper Canal': 'splatoon2/S2_Stage_Snapper_Canal.webp',
        'Starfish Mainstage': 'splatoon2/S2_Stage_Starfish_Mainstage.webp',
        'Sturgeon Shipyard': 'splatoon2/S2_Stage_Sturgeon_Shipyard.webp',
        'The Reef': 'splatoon2/S2_Stage_The_Reef.webp',
        'Wahoo World': 'splatoon2/S2_Stage_Wahoo_World.webp',
        'Walleye Warehouse': 'splatoon2/S2_Stage_Walleye_Warehouse.webp',
        'Skipper Pavilion': 'splatoon2/S2_Stage_Skipper_Pavilion.webp',
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
        },
        [Locale.EU_FR]: {
            'Clam Blitz': 'Pluie de palourdes',
            'Tower Control': 'Expédition risquée',
            Rainmaker: 'Mission Bazookarpe',
            'Splat Zones': 'Défense de zone',
            'Turf War': 'Guerre de territoire'
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
                    title: 'Green vs Grape',
                    clrA: '#37FC00',
                    clrB: '#7D28FC',
                    clrNeutral: '#F4067E'
                },
                {
                    index: 1,
                    title: 'Green vs Magenta',
                    clrA: '#04D976',
                    clrB: '#D600AB',
                    clrNeutral: '#D2E500'
                },
                {
                    index: 2,
                    title: 'Turquoise vs Orange',
                    clrA: '#10E38F',
                    clrB: '#FB7B08',
                    clrNeutral: '#6912CD'
                },
                {
                    index: 3,
                    title: 'Mustard vs Purple',
                    clrA: '#FF9E03',
                    clrB: '#B909E0',
                    clrNeutral: '#08C66B'
                },
                {
                    index: 4,
                    title: 'Dark Blue vs Green',
                    clrA: '#2F27CC',
                    clrB: '#37FC00',
                    clrNeutral: '#EA01B7'
                },
                {
                    index: 5,
                    title: 'Purple vs Green',
                    clrA: '#B909E0',
                    clrB: '#37FC00',
                    clrNeutral: '#F87604'
                },
                {
                    index: 6,
                    title: 'Yellow vs Blue',
                    clrA: '#FEF232',
                    clrB: '#2ED2FE',
                    clrNeutral: '#FD5600'
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
                    clrNeutral: '#0EB962'
                },
                {
                    index: 1,
                    title: 'Pink vs Blue',
                    clrA: '#E61077',
                    clrB: '#361CB8',
                    clrNeutral: '#24C133'
                },
                {
                    index: 2,
                    title: 'Pink vs Yellow',
                    clrA: '#ED0C6A',
                    clrB: '#D5E802',
                    clrNeutral: '#08C24D'
                },
                {
                    index: 3,
                    title: 'Purple vs Turquoise',
                    clrA: '#6B10CC',
                    clrB: '#08CC81',
                    clrNeutral: '#EB246D'
                },
                {
                    index: 4,
                    title: 'Pink vs Light Blue',
                    clrA: '#E30960',
                    clrB: '#02ADCF',
                    clrNeutral: '#DDE713'
                },
                {
                    index: 5,
                    title: 'Purple vs Orange',
                    clrA: '#5617C2',
                    clrB: '#FF5F03',
                    clrNeutral: '#ACE81E'
                },
                {
                    index: 6,
                    title: 'Pink vs Green',
                    clrA: '#E60572',
                    clrB: '#1BBF0F',
                    clrNeutral: '#CCE50C'
                },
                {
                    index: 7,
                    title: 'Yellow vs Blue',
                    clrA: '#F1CE33',
                    clrB: '#4B12BE',
                    clrNeutral: '#E62E96'
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
                    clrNeutral: '#DC1589'
                }
            ]
        }
    ]
});
