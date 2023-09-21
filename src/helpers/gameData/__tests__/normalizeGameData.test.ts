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
                }
            },
            colors: [
                {
                    meta: {
                        name: 'Cool Colors'
                    },
                    colors: [
                        {
                            index: 0,
                            title: 'Color One',
                            clrA: '#000',
                            clrB: '#FFF',
                            clrNeutral: '#AAA',
                            isCustom: false
                        }
                    ]
                },
                {
                    meta: {
                        name: 'Cool Colors 2'
                    },
                    colors: [
                        {
                            index: 0,
                            title: 'Color Two',
                            clrA: '#898',
                            clrB: '#999',
                            clrNeutral: '#EEE',
                            isCustom: false
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
                }
            },
            colors: [
                {
                    meta: {
                        name: 'Cool Colors'
                    },
                    colors: [
                        {
                            index: 0,
                            title: 'Color One',
                            clrA: '#000',
                            clrB: '#FFF',
                            clrNeutral: '#AAA',
                            isCustom: false
                        }
                    ]
                },
                {
                    meta: {
                        name: 'Cool Colors 2'
                    },
                    colors: [
                        {
                            index: 0,
                            title: 'Color Two',
                            clrA: '#898',
                            clrB: '#999',
                            clrNeutral: '#EEE',
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
            ]
        });
    });
});
