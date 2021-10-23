import { addDots, padNumber, pluralize } from '../stringHelper';

describe('stringHelper', () => {
    describe('addDots', () => {
        it('cuts off long strings', () => {
            expect(addDots('abcdefghijklmn', 10)).toEqual('abcdefg...');
        });

        it('does not cut off short strings', () => {
            expect(addDots('A', 2)).toEqual('A');
        });
    });

    describe('pluralize', () => {
        it('gives singular form if required', () => {
            expect(pluralize('knife', 1, 'knives')).toEqual('1 knife');
            expect(pluralize('user', 1)).toEqual('1 user');
        });

        it('gives plural form if required', () => {
            expect(pluralize('knife', 2, 'knives')).toEqual('2 knives');
            expect(pluralize('user', 0)).toEqual('0 users');
        });
    });

    describe('padNumber', () => {
        it('pads number with given amount of zeroes', () => {
            expect(padNumber(1235, 9)).toEqual('000001235');
            expect(padNumber('999', 5)).toEqual('00999');
        });

        it('does not pad number if not necessary', () => {
            expect(padNumber(504278, 5)).toEqual('504278');
            expect(padNumber('1234', 4)).toEqual('1234');
        });
    });
});
