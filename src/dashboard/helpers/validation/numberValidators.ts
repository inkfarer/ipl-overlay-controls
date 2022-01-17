import { ValidatorResult } from './validator';

export function maxValue(maxValue: number): (value: number) => ValidatorResult {
    return (value: number) => {
        return {
            isValid: value === null || value === undefined || maxValue >= value,
            message: `Must not be above ${maxValue}`
        };
    };
}

export function minValue(minValue: number): (value: number) => ValidatorResult {
    return (value: number) => {
        return {
            isValid: value === null || value === undefined || value >= minValue,
            message: `Must not be below ${minValue}`
        };
    };
}
