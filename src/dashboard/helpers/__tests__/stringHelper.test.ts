import { addDots, pluralize } from '../stringHelper';

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
});
