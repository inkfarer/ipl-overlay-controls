<template>
    <div class="ipl-input__wrapper">
        <div
            class="ipl-input__text-input-wrapper"
            :class="{ 'has-error': !isValid, 'is-color': type === 'color' }"
        >
            <ipl-label :class="{ 'has-error': !isValid }">
                {{ label }}
                <input
                    v-model="model"
                    :name="name"
                    :type="type"
                    :class="{ centered: centered }"
                    @focus="handleFocusEvent"
                    @blur="handleFocusEvent"
                    @input="handleFocusEvent($event), handleInputEvent()"
                >
            </ipl-label>
        </div>
        <span
            v-if="!!validator"
            v-show="!isValid"
            class="error"
        >{{ validator.message }}</span>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
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
            type: String,
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
        }
    },

    emits: [ 'update:modelValue', 'focuschange', 'input' ],

    setup(props, { emit }) {
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
                emit('focuschange', e.type !== 'blur');
            },
            handleInputEvent() {
                emit('input');
            }
        };
    }
});
</script>

<style lang="scss" scoped>
.ipl-input__text-input-wrapper {
    border-bottom: 1px solid #737373;
    transition-duration: 100ms;

    &:focus-within {
        border-color: white;

        label {
            color: white;
        }
    }

    &.has-error {
        border-bottom: 1px solid #E74E36;
    }

    &.is-color {
        border-bottom: unset !important;
    }
}

label.has-error {
    color: #E74E36 !important;
}

input {
    background-color: transparent;
    border: 0;
    width: 100%;
    color: white;
    font-size: 1.4em;
    font-family: 'Roboto', sans-serif;
    display: block;
    box-sizing: border-box;
    margin: 2px 0;
    padding: 0;

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
        background-color: #2f3a4f;
        padding: 5px;
        height: 36px;
        border-radius: 7px;
    }

    &.centered {
        text-align: center;
    }
}

.error {
    color: #E74E36;
    font-size: 0.75em;
}
</style>
