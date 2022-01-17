import { maxValue, minValue } from '../numberValidators';

describe('maxValue', () => {
    const validator1 = maxValue(100);
    const validator2 = maxValue(50);

    it('is valid if value is below maximum', () => {
        expect(validator1(null).isValid).toEqual(true);
        expect(validator1(undefined).isValid).toEqual(true);
        expect(validator1(100).isValid).toEqual(true);
        expect(validator1(84).isValid).toEqual(true);

        expect(validator2(null).isValid).toEqual(true);
        expect(validator2(undefined).isValid).toEqual(true);
        expect(validator2(50).isValid).toEqual(true);
        expect(validator2(-21).isValid).toEqual(true);
    });

    it('is invalid if value is above maximum', () => {
        expect(validator1(101).isValid).toEqual(false);
        expect(validator1(49817).isValid).toEqual(false);

        expect(validator2(15084).isValid).toEqual(false);
    });

    it('has expected message', () => {
        expect(validator1(100).message).toEqual('Must not be above 100');
        expect(validator2(12).message).toEqual('Must not be above 50');
    });
});

describe('minValue', () => {
    const validator1 = minValue(100);
    const validator2 = minValue(50);

    it('is valid if value is above minimum', () => {
        expect(validator1(null).isValid).toEqual(true);
        expect(validator1(undefined).isValid).toEqual(true);
        expect(validator1(100).isValid).toEqual(true);
        expect(validator1(403829).isValid).toEqual(true);

        expect(validator2(null).isValid).toEqual(true);
        expect(validator2(undefined).isValid).toEqual(true);
        expect(validator2(50).isValid).toEqual(true);
        expect(validator2(2929).isValid).toEqual(true);
    });

    it('is invalid if value is below minimum', () => {
        expect(validator1(99).isValid).toEqual(false);
        expect(validator1(-1290845).isValid).toEqual(false);

        expect(validator2(32).isValid).toEqual(false);
    });

    it('has expected message', () => {
        expect(validator1(100).message).toEqual('Must not be below 100');
        expect(validator2(12).message).toEqual('Must not be below 50');
    });
});
