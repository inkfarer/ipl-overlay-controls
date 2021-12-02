<template>
    <div class="ipl-input__wrapper">
        <div
            class="ipl-input__text-input-wrapper"
            :class="{ 'has-error': !isValid, 'is-color': type === 'color', 'layout horizontal': !!extra }"
        >
            <div>
                <ipl-label :class="{ 'has-error': !isValid }">
                    {{ label }}
                    <input
                        ref="input"
                        v-model="model"
                        :name="name"
                        :type="type"
                        :class="{ centered: centered }"
                        :disabled="disabled"
                        @focus="handleFocusEvent"
                        @blur="handleFocusEvent"
                        @input="handleFocusEvent($event), handleInputEvent()"
                    >
                </ipl-label>
            </div>
            <span
                v-if="extra"
                class="extra"
                @click="focus"
            >
                {{ extra }}
            </span>
        </div>
        <span
            v-if="!!validator"
            v-show="!isValid"
            class="error"
        >
            {{ validator.message }}
        </span>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, Ref, ref } from 'vue';
import { ValidatorResult } from '../helpers/validation/validator';
import IplLabel from './iplLabel.vue';

export default defineComponent({
    name: 'IplInput',

    components: { IplLabel },

    props: {
        label: {
            type: String,
            default: null
        },
        modelValue: {
            type: [String, Number],
            default: ''
        },
        type: {
            type: String as PropType<'text' | 'number' | 'color'>,
            default: 'text',
            validator: (value: string) => {
                return ['text', 'number', 'color'].includes(value);
            }
        },
        name: {
            type: String,
            required: true
        },
        validator: {
            type: Object as PropType<ValidatorResult>,
            default: null
        },
        centered: {
            type: Boolean,
            default: false
        },
        formatter: {
            type: Function as PropType<(value: string) => string>,
            default: null
        },
        disabled: {
            type: Boolean,
            default: false
        },
        extra: {
            type: String,
            default: null
        }
    },

    emits: [ 'update:modelValue', 'focuschange', 'input' ],

    setup(props, { emit }) {
        const input: Ref<HTMLInputElement> = ref(null);

        return {
            model: computed({
                get() {
                    return props.modelValue;
                },
                set(value: string) {
                    emit('update:modelValue', props.formatter ? props.formatter(value) : value);
                }
            }),
            isValid: computed(() => {
                return !props.validator ? true : props.validator?.isValid ?? true;
            }),
            handleFocusEvent(e: Event) {
                if (e.type === 'blur') {
                    input.value.value = props.modelValue.toString();
                }
                emit('focuschange', e.type !== 'blur');
            },
            handleInputEvent() {
                emit('input');
            },
            focus() {
                input.value.focus();
            },
            input
        };
    }
});
</script>

<style lang="scss" scoped>
@import './src/dashboard/styles/colors';
@import './src/dashboard/styles/constants';

.ipl-input__text-input-wrapper {
    border-bottom: 1px solid $input-color;
    transition-duration: $transition-duration-low;
    width: 100%;

    &:focus-within {
        border-color: $input-color-active;

        label {
            color: $input-color-active;
        }
    }

    &.has-error {
        border-color: $error-color;
    }

    &.is-color {
        border-bottom: unset !important;
    }
}

label.has-error {
    color: $error-color !important;
}

input {
    background-color: transparent;
    border: 0;
    width: 100%;
    color: $text-color;
    font-size: 1.4em;
    font-family: 'Roboto', sans-serif;
    display: block;
    box-sizing: border-box;
    margin: 2px 0;
    padding: 0;

    &:disabled {
        color: $text-color-disabled;
    }

    &:focus {
        outline: none;
    }

    &[type='number'] {
        -moz-appearance: textfield;
    }

    &[type='number']::-webkit-outer-spin-button,
    &[type='number']::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    &[type='color'] {
        background-color: $background-secondary;
        padding: 5px;
        height: 36px;
        border-radius: $border-radius-inner;

        &:disabled {
            background-color: $background-tertiary;
        }
    }

    &.centered {
        text-align: center;
    }
}

.error {
    color: $error-color;
    font-size: 0.75em;
}

.extra {
    align-self: flex-end;
    margin-bottom: 2px;
    margin-left: 4px;
    user-select: none;
    cursor: text;
    float: right;
}
</style>
