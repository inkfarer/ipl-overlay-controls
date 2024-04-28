import isEmpty from 'lodash/isEmpty';
import trim from 'lodash/trim';
import type { ValidatorResult } from '@iplsplatoon/vue-components';
import i18next from 'i18next';

export function minLength(length: number): (value?: string | null) => ValidatorResult {
    return (value?: string | null) => {
        return {
            isValid: isEmpty(value) || (value?.length ?? 0) >= length,
            message: i18next.t('common:validationError.minLength', { count: length })
        };
    };
}

export function maxLength(length: number): (value?: string | null) => ValidatorResult {
    return (value?: string | null) => {
        return {
            isValid: isEmpty(value) || length >= (value?.length ?? 0),
            message: i18next.t('common:validationError.maxLength', { count: length })
        };
    };
}

export const numeric: (value?: string | null) => ValidatorResult = (value?: string | null) => ({
    isValid: isEmpty(value) || /^\d*$/.test(value ?? ''),
    message: i18next.t('common:validationError.numeric')
});

export const notBlank: (value: string) => ValidatorResult = (value) => ({
    isValid: trim(value) !== '',
    message: i18next.t('common:validationError.notBlank')
});
