import { normalizeGameData } from '../normalizeGameData';

describe('normalizeGameData', () => {
    it('adds common properties to game data', () => {
        expect(normalizeGameData({
            stages: [
                'Cool Stage',
                'Dope Stage'
            ],
            modes: [
                'Turf War',
                'Clam Blitz'
            ],
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
            stages: [
                'Cool Stage',
                'Counterpick',
                'Dope Stage',
                'Unknown Stage'
            ],
            modes: [
                'Clam Blitz',
                'Turf War',
                'Unknown Mode'
            ],
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
