import { reactive, watch, WatchSource } from 'vue';

export interface ValidatorResult {
    isValid: boolean
    message?: string
}

export function validator<T>(
    value: WatchSource<T>,
    immediate: boolean,
    ...validators: ((value: T) => ValidatorResult)[]
): ValidatorResult {
    const result: ValidatorResult = reactive({
        isValid: null
    });

    watch(value, newValue => {
        for (let i = 0; i < validators.length; i++) {
            const validatorResult = validators[i](newValue);
            if (!validatorResult.isValid) {
                result.isValid = false;
                result.message = validatorResult.message;
                break;
            } else {
                result.isValid = true;
                result.message = null;
            }
        }
    }, { immediate });

    return result;
}

export function allValid(validators: Record<string, ValidatorResult>): boolean {
    return Object.values(validators).every(validator => validator.isValid);
}
