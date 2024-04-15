import { maxLength, minLength, notBlank, numeric } from '../stringValidators';

describe('minLength', () => {
    const validator1 = minLength(10);
    const validator2 = minLength(4);

    it('is valid if string is over minimum length', () => {
        expect(validator1(undefined).isValid).toEqual(true);
        expect(validator1(null).isValid).toEqual(true);
        expect(validator1('aaaaaaaaaa').isValid).toEqual(true);
        expect(validator1('aaaaaaaaaaa').isValid).toEqual(true);

        expect(validator2(undefined).isValid).toEqual(true);
        expect(validator2(null).isValid).toEqual(true);
        expect(validator2('test').isValid).toEqual(true);
        expect(validator2('test!').isValid).toEqual(true);
    });

    it('is invalid if string is below minimum length', () => {
        expect(validator1('aaaaaaaaa').isValid).toEqual(false);
        expect(validator2('tes').isValid).toEqual(false);
    });

    it('has expected message', () => {
        expect(validator1('a').message).toEqual('common:validationError.minLength');
    });
});

describe('maxLength', () => {
    const validator1 = maxLength(10);
    const validator2 = maxLength(4);

    it('is valid if string is below maximum length', () => {
        expect(validator1(undefined).isValid).toEqual(true);
        expect(validator1(null).isValid).toEqual(true);
        expect(validator1('aaaaaaaaaa').isValid).toEqual(true);
        expect(validator1('aaaaaa').isValid).toEqual(true);

        expect(validator2(undefined).isValid).toEqual(true);
        expect(validator2(null).isValid).toEqual(true);
        expect(validator2('aaaa').isValid).toEqual(true);
        expect(validator2('aa').isValid).toEqual(true);
    });

    it('is invalid if string is above maximum length', () => {
        expect(validator1('aaaaaaaaaaa').isValid).toEqual(false);
        expect(validator2('aaaaa').isValid).toEqual(false);
    });

    it('has expected message', () => {
        expect(validator1('a').message).toEqual('common:validationError.maxLength');
    });
});

describe('numeric', () => {
    it('is valid if string is numeric', () => {
        expect(numeric('0123456789').isValid).toEqual(true);
    });

    it('is invalid if string is not numeric', () => {
        expect(numeric('A1234').isValid).toEqual(false);
    });

    it('is valid if string is missing or empty', () => {
        expect(numeric('').isValid).toEqual(true);
        expect(numeric(undefined).isValid).toEqual(true);
        expect(numeric(null).isValid).toEqual(true);
    });
});

describe('notBlank', () => {
    it('is valid if string is not blank', () => {
        expect(notBlank('asdasd').isValid).toEqual(true);
        expect(notBlank('   text    ').isValid).toEqual(true);
    });

    it('is invalid if string is blank', () => {
        expect(notBlank('').isValid).toEqual(false);
        expect(notBlank('              ').isValid).toEqual(false);
        expect(notBlank(' ').isValid).toEqual(false);
        expect(notBlank(' ').isValid).toEqual(false);
        expect(notBlank(' ').isValid).toEqual(false);
        expect(notBlank('\t').isValid).toEqual(false);
        expect(notBlank('　').isValid).toEqual(false);
    });
});
