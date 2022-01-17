import * as Vue from 'vue';
import { allValid, validator } from '../validator';
import Mock = jest.Mock;

describe('validator.ts', () => {
    describe('validator', () => {
        jest.spyOn(Vue, 'watch');

        it('watches given value', () => {
            const value = () => 'test';

            validator(value, true);

            expect(Vue.watch).toHaveBeenCalledWith(value, expect.any(Function), { immediate: true });
        });

        it('watches given value if immediate is false', () => {
            const value = () => 'test';

            validator(value, false);

            expect(Vue.watch).toHaveBeenCalledWith(value, expect.any(Function), { immediate: false });
        });

        it('validates given value when watcher is triggered with a valid value', () => {
            const validatorFn = jest.fn().mockReturnValue({ isValid: true, message: 'mock message' });
            const result = validator(() => 'test', false, validatorFn);
            const watchCallback = (Vue.watch as Mock).mock.calls[0][1];

            watchCallback('new value');

            expect(validatorFn).toHaveBeenCalledWith('new value');
            expect(result).toEqual({ isValid: true, message: null });
        });

        it('validates given value when watcher is triggered with an invalid value', () => {
            const validatorFn = jest.fn().mockReturnValue({ isValid: false, message: 'mock message' });
            const result = validator(() => 'test', false, validatorFn);
            const watchCallback = (Vue.watch as Mock).mock.calls[0][1];

            watchCallback('new value');

            expect(validatorFn).toHaveBeenCalledWith('new value');
            expect(result).toEqual({ isValid: false, message: 'mock message' });
        });

        it('uses every given validator', () => {
            const validatorFn1 = jest.fn().mockReturnValue({ isValid: true, message: 'mock message 1' });
            const validatorFn2 = jest.fn().mockReturnValue({ isValid: false, message: 'mock message 2' });
            const result = validator(() => 'test', false, validatorFn1, validatorFn2);
            const watchCallback = (Vue.watch as Mock).mock.calls[0][1];

            watchCallback('test validator value');

            expect(validatorFn1).toHaveBeenCalledWith('test validator value');
            expect(validatorFn2).toHaveBeenCalledWith('test validator value');
            expect(result).toEqual({ isValid: false, message: 'mock message 2' });
        });
    });

    describe('allValid', () => {
        it('is true if all values are valid', () => {
            expect(allValid({ a: { isValid: true }, b: { isValid: true } })).toEqual(true);
        });

        it('is false if some values are invalid', () => {
            expect(allValid({ c: { isValid: false }, d: { isValid: true } })).toEqual(false);
        });

        it('is false if all values are invalid', () => {
            expect(allValid({ a: { isValid: false }, b: { isValid: false } })).toEqual(false);
        });

        it('is false if validation has not been done', () => {
            expect(allValid({ a: { isValid: null }, b: { isValid: null } })).toEqual(false);
        });
    });
});
