import { GameData } from './gameData';
import { normalizeGameData } from './normalizeGameData';
import { Locale } from '../../types/enums/Locale';

export const Splatoon3Stages = [
    'Museum d\'Alfonsino',
    'Scorch Gorge',
    'Eeltail Alley',
    'Hagglefish Market',
    'Undertow Spillway',
    'Mincemeat Metalworks',
    'Hammerhead Bridge',
    'Mahi-Mahi Resort',
    'Inkblot Art Academy',
    'Sturgeon Shipyard',
    'MakoMart',
    'Wahoo World',
    'Brinewater Springs',
    'Flounder Heights',
    'Um\'ami Ruins',
    'Manta Maria',
    'Barnacle & Dime',
    'Humpback Pump Track',
    'Crableg Capital',
    'Shipshape Cargo Co.',
    'Robo ROM-en',
    'Bluefin Depot',
    'Marlin Airport'
] as const;

export const Splatoon3Modes = [
    'Clam Blitz',
    'Tower Control',
    'Rainmaker',
    'Splat Zones',
    'Turf War'
] as const;

export const splatoon3Data: GameData<typeof Splatoon3Stages, typeof Splatoon3Modes> = normalizeGameData({
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
            'Manta Maria': 'Manta Maria',
            'Barnacle & Dime': 'Barnacle & Dime',
            'Humpback Pump Track': 'Humpback Pump Track',
            'Crableg Capital': 'Crableg Capital',
            'Shipshape Cargo Co.': 'Shipshape Cargo Co.',
            'Robo ROM-en': 'Robo ROM-en',
            'Bluefin Depot': 'Bluefin Depot',
            'Marlin Airport': 'Marlin Airport'
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
            'Manta Maria': 'Manta Maria',
            'Barnacle & Dime': 'Talerfisch & Pock',
            'Humpback Pump Track': 'Buckelwal-Piste',
            'Crableg Capital': 'Majidae Skyline',
            'Shipshape Cargo Co.': 'Cargo Ship Heavyfish',
            'Robo ROM-en': 'ROM & RAMen',
            'Bluefin Depot': 'Blauflossen-Depot',
            'Marlin Airport': 'La Ola Airport'
        },
        [Locale.EU_FR]: {
            'Museum d\'Alfonsino': 'Galeries Guppy',
            'Scorch Gorge': 'Canyon aux colonnes',
            'Eeltail Alley': 'Banlieue Balibot',
            'Hagglefish Market': 'Marché Grefin',
            'Undertow Spillway': 'Réservoir Rigadelle',
            'Mincemeat Metalworks': 'Casse Rascasse',
            'Hammerhead Bridge': 'Pont Esturgeon',
            'Mahi-Mahi Resort': 'Club Ca$halot',
            'Inkblot Art Academy': 'Institut Calam\'arts',
            'Sturgeon Shipyard': 'Chantier Narval',
            MakoMart: 'Supermarché Cétacé',
            'Wahoo World': 'Parc Carapince',
            'Brinewater Springs': 'Sources Sauret',
            'Flounder Heights': 'Lotissement Filament',
            'Um\'ami Ruins': 'Ruines Uma\'mi',
            'Manta Maria': 'Manta Maria',
            'Barnacle & Dime': 'Halles de Port-merlu',
            'Humpback Pump Track': 'Piste Méroule',
            'Crableg Capital': 'Quartier Crabe-ciels',
            'Shipshape Cargo Co.': 'Chaland Flétan',
            'Robo ROM-en': 'Arène Méca-ramen',
            'Bluefin Depot': 'Mine Marine',
            'Marlin Airport': 'Terminal Rorqual'
        },
        [Locale.JA]: {
            'Museum d\'Alfonsino': 'キンメダイ美術館',
            'Scorch Gorge': 'ユノハナ大渓谷',
            'Eeltail Alley': 'ゴンズイ地区',
            'Hagglefish Market': 'ヤガラ市場',
            'Undertow Spillway': 'マテガイ放水路',
            'Mincemeat Metalworks': 'ナメロウ金属',
            'Hammerhead Bridge': 'マサバ海峡大橋',
            'Mahi-Mahi Resort': 'マヒマヒリゾート＆スパ',
            'Inkblot Art Academy': '海女美術大学',
            'Sturgeon Shipyard': 'チョウザメ造船',
            MakoMart: 'ザトウマーケット',
            'Wahoo World': 'スメーシーワールド',
            'Brinewater Springs': 'クサヤ温泉',
            'Flounder Heights': 'ヒラメが丘団地',
            'Um\'ami Ruins': 'ナンプラー遺跡',
            'Manta Maria': 'マンタマリア号',
            'Barnacle & Dime': 'タラポートショッピングパーク',
            'Humpback Pump Track': 'コンブトラック',
            'Crableg Capital': 'タカアシ経済特区',
            'Shipshape Cargo Co.': 'オヒョウ海運',
            'Robo ROM-en': 'バイガイ亭',
            'Bluefin Depot': 'ネギトロ炭鉱',
            'Marlin Airport': 'カジキ空港'
        }
    },
    stageImagePaths: {
        'Humpback Pump Track': 'splatoon3/S3_Stage_Humpback_Pump_Track.webp',
        'Inkblot Art Academy': 'splatoon3/S3_Stage_Inkblot_Art_Academy.webp',
        MakoMart: 'splatoon3/S3_Stage_MakoMart.webp',
        'Manta Maria': 'splatoon3/S3_Stage_Manta_Maria.webp',
        'Sturgeon Shipyard': 'splatoon3/S3_Stage_Sturgeon_Shipyard.webp',
        'Wahoo World': 'splatoon3/S3_Stage_Wahoo_World.webp',
        'Museum d\'Alfonsino': 'splatoon3/S3_Stage_Museum_dAlfonsino.webp',
        'Scorch Gorge': 'splatoon3/S3_Stage_Scorch_Gorge.webp',
        'Eeltail Alley': 'splatoon3/S3_Stage_Eeltail_Alley.webp',
        'Hagglefish Market': 'splatoon3/S3_Stage_Hagglefish_Market.webp',
        'Undertow Spillway': 'splatoon3/S3_Stage_Undertow_Spillway.webp',
        'Mincemeat Metalworks': 'splatoon3/S3_Stage_Mincemeat_Metalworks.webp',
        'Hammerhead Bridge': 'splatoon3/S3_Stage_Hammerhead_Bridge.webp',
        'Mahi-Mahi Resort': 'splatoon3/S3_Stage_Mahi_Mahi_Resort.webp',
        'Brinewater Springs': 'splatoon3/S3_Stage_Brinewater_Springs.webp',
        'Flounder Heights': 'splatoon3/S3_Stage_Flounder_Heights.webp',
        'Um\'ami Ruins': 'splatoon3/S3_Stage_Umami_Ruins.webp',
        'Barnacle & Dime': 'splatoon3/S3_Stage_Barnacle_&_Dime.webp',
        'Crableg Capital': 'splatoon3/S3_Stage_Crableg_Capital.webp',
        'Shipshape Cargo Co.': 'splatoon3/S3_Stage_Shipshape_Cargo_Co..webp',
        'Robo ROM-en': 'splatoon3/S3_Stage_Robo_ROM-en.webp',
        'Bluefin Depot': 'splatoon3/S3_Stage_Bluefin_Depot.webp',
        'Marlin Airport': 'splatoon3/S3_Marlin_Airport_Fresh_Season_2024_trailer.webp'
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
        },
        [Locale.JA]: {
            'Clam Blitz': 'ガチアサリ',
            'Tower Control': 'ガチヤグラ',
            Rainmaker: 'ガチホコバトル',
            'Splat Zones': 'ガチエリア',
            'Turf War': 'ナワバリバトル'
        }
    },
    colors: [
        {
            meta: {
                name: 'Ranked Modes',
                key: 'rankedModes'
            },
            colors: [
                {
                    index: 0,
                    title: 'Orange vs Purple',
                    key: 'orangePurple',
                    clrA: '#F56522',
                    clrB: '#821CD6',
                    clrNeutral: '#CDFF45'
                },
                {
                    index: 1,
                    title: 'Yellow vs Dark Blue',
                    key: 'yellowDarkBlue',
                    clrA: '#EDD921',
                    clrB: '#461EE6',
                    clrNeutral: '#4445FF'
                },
                {
                    index: 2,
                    title: 'Turquoise vs Orange',
                    key: 'turquoiseOrange',
                    clrA: '#2ADBC6',
                    clrB: '#FA5A41',
                    clrNeutral: '#4445FF'
                },
                {
                    index: 3,
                    title: 'Orange vs Dark Blue',
                    key: 'orangeDarkBlue',
                    clrA: '#FC7735',
                    clrB: '#4048DB',
                    clrNeutral: '#F8F755'
                },
                {
                    index: 4,
                    title: 'Turquoise vs Pink',
                    key: 'turquoisePink',
                    clrA: '#2ADBC3',
                    clrB: '#E34984',
                    clrNeutral: '#7577FF'
                },
                {
                    index: 5,
                    title: 'Dark Blue vs Orange',
                    key: 'darkBlueOrange',
                    clrA: '#2C2CDB',
                    clrB: '#F29C33',
                    clrNeutral: '#FF67EE'
                },
                {
                    index: 6,
                    title: 'Yellow vs Purple',
                    key: 'yellowPurple',
                    clrA: '#EEFC58',
                    clrB: '#7635F0',
                    clrNeutral: '#54FDE8'
                },
                {
                    index: 7,
                    title: 'Gold vs Purple',
                    key: 'goldPurple',
                    clrA: '#EBCC31',
                    clrB: '#A032DB',
                    clrNeutral: '#73DE35'
                },
                {
                    index: 8,
                    title: 'Green vs Pink',
                    key: 'greenPink',
                    clrA: '#B3DE45',
                    clrB: '#D43BCA',
                    clrNeutral: '#FFC042'
                },
                {
                    index: 9,
                    title: 'Pink vs Green',
                    key: 'pinkGreen',
                    clrA: '#F753A1',
                    clrB: '#35CC2D',
                    clrNeutral: '#4A36FF'
                }
            ]
        },
        {
            meta: {
                name: 'Color Lock (Variant 1)',
                key: 'colorLock1'
            },
            colors: [
                {
                    index: 0,
                    title: 'Purple vs Yellow',
                    key: 'purpleYellow',
                    clrA: '#6236DF',
                    clrB: '#F0EB24',
                    clrNeutral: '#B82FB6'
                }
            ]
        },
        {
            meta: {
                name: 'Color Lock (Variant 2)',
                key: 'colorLock2'
            },
            colors: [
                {
                    index: 0,
                    title: 'Blue vs Orange',
                    key: 'blueOrange',
                    clrA: '#2D63D7',
                    clrB: '#FDB605',
                    clrNeutral: '#8FD20C'
                }
            ]
        }
    ]
});
