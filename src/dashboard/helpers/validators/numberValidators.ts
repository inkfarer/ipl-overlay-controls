import { ValidatorResult } from '@iplsplatoon/vue-components';
import i18next from 'i18next';

export function maxValue(maxValue: number): (value?: number | null) => ValidatorResult {
    return (value?: number | null) => {
        return {
            isValid: value === null || value === undefined || maxValue >= value,
            message: i18next.t('common:validationError.maxValue', { count: maxValue })
        };
    };
}

export function minValue(minValue: number): (value?: number | null) => ValidatorResult {
    return (value?: number | null) => {
        return {
            isValid: value === null || value === undefined || value >= minValue,
            message: i18next.t('common:validationError.minValue', { count: minValue })
        };
    };
}
