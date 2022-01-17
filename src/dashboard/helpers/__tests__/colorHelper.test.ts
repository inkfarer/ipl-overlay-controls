import { getContrastingTextColor, hexToRbg } from '../colorHelper';

describe('colorHelper', () => {
    describe('getContrastingTextColor', () => {
        it('returns a dark color if applicable', () => {
            expect(getContrastingTextColor('#ffffff')).toEqual('#333');
            expect(getContrastingTextColor('#00ff00')).toEqual('#333');
            expect(getContrastingTextColor('ffff00')).toEqual('#333');
            expect(getContrastingTextColor('ffff00', 'red', 'blue')).toEqual('blue');
        });

        it('returns a light color if applicable', () => {
            expect(getContrastingTextColor('#0000ff')).toEqual('white');
            expect(getContrastingTextColor('#A80000')).toEqual('white');
            expect(getContrastingTextColor('005238')).toEqual('white');
            expect(getContrastingTextColor('005238', 'blue', 'black')).toEqual('blue');
        });
    });

    describe('hexToRbg', () => {
        it('converts hex colors to RGB values', () => {
            expect(hexToRbg('#0053EA')).toEqual({ r: 0, g: 83, b: 234 });
            expect(hexToRbg('#EA06D1')).toEqual({ r: 234, g: 6, b: 209 });
        });
    });
});
