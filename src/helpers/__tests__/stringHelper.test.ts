import { addDots, isBlank } from '../stringHelper';

describe('addDots', () => {
    it('cuts off long strings', () => {
        expect(addDots('abcdefghijklmn', 10)).toEqual('abcdefg...');
    });

    it('does not cut off short strings', () => {
        expect(addDots('A', 2)).toEqual('A');
    });
});

describe('isBlank', () => {
    it('is true if value is null', () => {
        expect(isBlank(null)).toEqual(true);
    });

    it('is true if value is undefined', () => {
        expect(isBlank(undefined)).toEqual(true);
    });

    it('is true if value is empty', () => {
        expect(isBlank('')).toEqual(true);
    });

    it('is true if value is blank', () => {
        expect(isBlank(' ')).toEqual(true);
        expect(isBlank('     ')).toEqual(true);
        expect(isBlank('\t')).toEqual(true);
        expect(isBlank(' ')).toEqual(true);
        expect(isBlank(' ')).toEqual(true);
        expect(isBlank(' ')).toEqual(true);
        expect(isBlank(' ')).toEqual(true);
        expect(isBlank(' ')).toEqual(true);
        expect(isBlank(' ')).toEqual(true);
        expect(isBlank(' ')).toEqual(true);
        expect(isBlank(' ')).toEqual(true);
        expect(isBlank(' ')).toEqual(true);
        expect(isBlank(' ')).toEqual(true);
        expect(isBlank(' ')).toEqual(true);
        expect(isBlank(' ')).toEqual(true);
        expect(isBlank(' ')).toEqual(true);
        expect(isBlank(' ')).toEqual(true);
        expect(isBlank(' ')).toEqual(true);
        expect(isBlank('　\t')).toEqual(true);
    });

    it('is true if the value is not a string', () => {
        // @ts-ignore
        expect(isBlank({})).toEqual(true);
        // @ts-ignore
        expect(isBlank(0)).toEqual(true);
        // @ts-ignore
        expect(isBlank([])).toEqual(true);
    });

    it('is false if value is not blank', () => {
        expect(isBlank('   test!!!   ')).toEqual(false);
        expect(isBlank('TEST!!!')).toEqual(false);
        expect(isBlank('something')).toEqual(false);
    });
});
