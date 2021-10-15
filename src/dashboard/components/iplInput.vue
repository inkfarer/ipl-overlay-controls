<template>
    <div
        class="ipl-input__wrapper"
        :class="{ 'has-error': !isValid }"
    >
        <label :class="{ 'has-error': !isValid }">
            {{ label }}
            <input
                v-model="model"
                :name="name"
                :type="type"
                @focus="handleFocusEvent"
                @blur="handleFocusEvent"
                @input="handleFocusEvent($event), handleInputEvent()"
            >
        </label>
    </div>
    <span
        v-if="!!validator"
        v-show="!isValid"
        class="error"
    >{{ validator.message }}</span>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { ValidatorResult } from '../helpers/validation/validator';

export default defineComponent({
    name: 'IplInput',

    props: {
        label: {
            type: String,
            required: true
        },
        modelValue: {
            type: String,
            default: ''
        },
        type: {
            type: String as PropType<'text' | 'number'>,
            default: 'text',
            validator: (value: string) => {
                return ['text', 'number'].includes(value);
            }
        },
        name: {
            type: String,
            required: true
        },
        validator: {
            type: Object as PropType<ValidatorResult>,
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
                set(value) {
                    emit('update:modelValue', value);
                }
            }),
            isValid: computed(() => {
                return !props.validator ? true : props.validator.isValid;
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
.ipl-input__wrapper {
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
}

label {
    color: #737373;
    font-size: 0.75em;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    transition-duration: 100ms;

    &.has-error {
        color: #E74E36 !important;
    }
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
}

.error {
    color: #E74E36;
    font-size: 0.75em;
}
</style>
