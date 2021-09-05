import { getColorOptionName } from '../splatoonData';

describe('splatoonData', () => {
    describe('getColorOptionName', () => {
        it('formats given input correctly', () => {
            expect(getColorOptionName(5, 'Color Category')).toBe('color-category_5');
            expect(getColorOptionName(10, 'COOLCLR')).toBe('coolclr_10');
            expect(getColorOptionName(1, 'COOL COLOR')).toBe('cool-color_1');
            expect(getColorOptionName(2, 'lower case cool color')).toBe('lower-case-cool-color_2');
        });
    });
});
