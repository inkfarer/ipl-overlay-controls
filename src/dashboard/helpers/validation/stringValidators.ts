import { ValidatorResult } from './validator';
import { pluralize } from '../stringHelper';

export function minLength(length: number): (value: string) => ValidatorResult {
    return (value: string) => {
        return {
            isValid: !!value && value.length >= length,
            message: `Must be at least ${pluralize('character', length)}`
        };
    };
}

export const numeric: (value: string) => ValidatorResult = (value) => ({
    isValid: /^\d*$/.test(value),
    message: 'Must be numeric'
});
