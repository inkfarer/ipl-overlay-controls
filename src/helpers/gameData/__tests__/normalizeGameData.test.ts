import { normalizeGameData } from '../normalizeGameData';
import { Locale } from '../../../types/enums/Locale';

describe('normalizeGameData', () => {
    it('adds common properties to game data', () => {
        expect(normalizeGameData({
            stages: {
                [Locale.EN]: {
                    'Cool Stage': 'Cool Stage',
                    'Dope Stage': 'Dope Stage'
                },
                [Locale.DE]: {
                    'Cool Stage': '[DE] Cool Stage',
                    'Dope Stage': '[DE] Dope Stage'
                },
                [Locale.EU_FR]: {
                    'Cool Stage': '[EU_FR] Cool Stage',
                    'Dope Stage': '[EU_FR] Dope Stage'
                },
                [Locale.JA]: {
                    'Cool Stage': '[JA] Cool Stage',
                    'Dope Stage': '[JA] Dope Stage'
                }
            },
            stageImagePaths: {
                'Cool Stage': 'images/cool-stage.png',
                'Dope Stage': 'images/dope-stage.png'
            },
            modes: {
                [Locale.EN]: {
                    'Turf War': 'Turf War',
                    'Clam Blitz': 'Clam Blitz'
                },
                [Locale.DE]: {
                    'Turf War': '[DE] Turf War',
                    'Clam Blitz': '[DE!] Clam Blitz'
                },
                [Locale.EU_FR]: {
                    'Turf War': '[EU_FR] Turf War',
                    'Clam Blitz': '[EU_FR] Clam Blitz'
                },
                [Locale.JA]: {
                    'Turf War': '[JA] Turf War',
                    'Clam Blitz': '[JA] Clam Blitz'
                }
            },
            colors: [
                {
                    meta: {
                        name: 'Cool Colors',
                        key: 'coolColors'
                    },
                    colors: [
                        {
                            index: 0,
                            title: 'Color One',
                            key: 'colorOne',
                            clrA: '#000',
                            clrB: '#FFF',
                            clrNeutral: '#AAA'
                        }
                    ],
                    colorFinderOptions: [
                        {
                            optionColor: '#001',
                            matchingColorKeys: ['colorOne', 'colorTwo']
                        },
                        {
                            optionColor: '#002',
                            matchingColorKeys: ['colorThree']
                        }
                    ]
                },
                {
                    meta: {
                        name: 'Cool Colors 2',
                        key: 'coolColors2'
                    },
                    colors: [
                        {
                            index: 0,
                            title: 'Color Two',
                            key: 'colorTwo',
                            clrA: '#898',
                            clrB: '#999',
                            clrNeutral: '#EEE'
                        }
                    ]
                }
            ]
        })).toEqual({
            stages: {
                [Locale.EN]: {
                    'Cool Stage': 'Cool Stage',
                    'Dope Stage': 'Dope Stage',
                    'Unknown Stage': 'Unknown Stage',
                    Counterpick: 'Counterpick'
                },
                [Locale.DE]: {
                    'Cool Stage': '[DE] Cool Stage',
                    'Dope Stage': '[DE] Dope Stage',
                    'Unknown Stage': 'Unbekannte Arena',
                    Counterpick: 'Counterpick'
                },
                [Locale.EU_FR]: {
                    'Cool Stage': '[EU_FR] Cool Stage',
                    'Dope Stage': '[EU_FR] Dope Stage',
                    'Unknown Stage': 'Stage à déterminer',
                    Counterpick: 'Counterpick'
                },
                [Locale.JA]: {
                    'Cool Stage': '[JA] Cool Stage',
                    'Dope Stage': '[JA] Dope Stage',
                    'Unknown Stage': 'ステージ未選択',
                    Counterpick: 'カウンターピック'
                }
            },
            stageImagePaths: {
                'Cool Stage': 'images/cool-stage.png',
                'Dope Stage': 'images/dope-stage.png'
            },
            modes: {
                [Locale.EN]: {
                    'Turf War': 'Turf War',
                    'Clam Blitz': 'Clam Blitz',
                    'Unknown Mode': 'Unknown Mode'
                },
                [Locale.DE]: {
                    'Turf War': '[DE] Turf War',
                    'Clam Blitz': '[DE!] Clam Blitz',
                    'Unknown Mode': 'Unbekannte Kampfart'
                },
                [Locale.EU_FR]: {
                    'Turf War': '[EU_FR] Turf War',
                    'Clam Blitz': '[EU_FR] Clam Blitz',
                    'Unknown Mode': 'Mode à déterminer'
                },
                [Locale.JA]: {
                    'Turf War': '[JA] Turf War',
                    'Clam Blitz': '[JA] Clam Blitz',
                    'Unknown Mode': 'ルール未選択'
                }
            },
            colors: [
                {
                    meta: {
                        name: 'Cool Colors',
                        key: 'coolColors'
                    },
                    colors: [
                        {
                            index: 0,
                            title: 'Color One',
                            key: 'colorOne',
                            clrA: '#000',
                            clrB: '#FFF',
                            clrNeutral: '#AAA',
                            isCustom: false
                        }
                    ],
                    colorFinderOptions: [
                        {
                            optionColor: '#001',
                            matchingColorKeys: ['colorOne']
                        }
                    ]
                },
                {
                    meta: {
                        name: 'Cool Colors 2',
                        key: 'coolColors2'
                    },
                    colors: [
                        {
                            index: 0,
                            title: 'Color Two',
                            key: 'colorTwo',
                            clrA: '#898',
                            clrB: '#999',
                            clrNeutral: '#EEE',
                            isCustom: false
                        }
                    ]
                },
                {
                    meta: {
                        name: 'Custom Color',
                        key: 'customColor'
                    },
                    colors: [
                        {
                            index: 0,
                            title: 'Custom Color',
                            key: 'customColor',
                            clrA: '#000000',
                            clrB: '#FFFFFF',
                            clrNeutral: '#818181',
                            isCustom: true
                        }
                    ]
                }
            ]
        });
    });
});
