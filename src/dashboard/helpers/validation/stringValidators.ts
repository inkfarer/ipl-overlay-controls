import { ValidatorResult } from './validator';
import { pluralize } from '../stringHelper';
import trim from 'lodash/trim';
import isEmpty from 'lodash/isEmpty';

export function minLength(length: number): (value: string) => ValidatorResult {
    return (value: string) => {
        return {
            isValid: isEmpty(value) || value.length >= length,
            message: `Must be at least ${pluralize('character', length)}`
        };
    };
}

export function maxLength(length: number): (value: string) => ValidatorResult {
    return (value: string) => {
        return {
            isValid: isEmpty(value) || length >= value.length,
            message: `Must not be over ${pluralize('character', length)}`
        };
    };
}

export const numeric: (value: string) => ValidatorResult = (value) => ({
    isValid: isEmpty(value) || /^\d*$/.test(value),
    message: 'Must be numeric'
});

export const notBlank: (value: string) => ValidatorResult = (value) => ({
    isValid: trim(value) !== '',
    message: 'Must not be blank'
});
