import { swapColors } from '../ColorHelper';

describe('ColorHelper', () => {
    describe('swapColors', () => {
        it('swaps colors in input', () => {
            expect(swapColors({
                index: 10,
                title: 'Test Color',
                key: 'testColor',
                clrA: '#aaaaaa',
                clrB: '#bbbbbb',
                referenceClrA: '#aaabbb',
                referenceClrB: '#bbbaaa',
                clrNeutral: '#cccccc',
                isCustom: false
            })).toEqual({
                index: 10,
                title: 'Test Color',
                key: 'testColor',
                clrB: '#aaaaaa',
                clrA: '#bbbbbb',
                referenceClrA: '#aaabbb',
                referenceClrB: '#bbbaaa',
                clrNeutral: '#cccccc',
                isCustom: false
            });
        });
    });
});
