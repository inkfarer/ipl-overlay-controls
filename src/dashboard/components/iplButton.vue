<template>
    <a
        class="ipl-button"
        :style="buttonStyle"
        :class="{ disabled: disabled }"
        @click="handleClick"
    >
        <span class="label">{{ label }}</span>
    </a>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { buttonColors } from '../styles/colors';

export default defineComponent({
    name: 'IplButton',

    props: {
        label: {
            type: String,
            required: true
        },
        color: {
            type: String as PropType<keyof typeof buttonColors>,
            default: 'blue',
            validator: (value: string) => {
                return Object.keys(buttonColors).includes(value);
            }
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },

    emits: ['click'],

    setup(props, { emit }) {
        return {
            buttonStyle: computed(() => ({
                backgroundColor: buttonColors[props.color]
            })),
            handleClick() {
                if (!props.disabled) {
                    emit('click');
                }
            }
        };
    }
});
</script>

<style lang="scss" scoped>
    .ipl-button {
        text-decoration: none;
        text-transform: uppercase;
        font-size: 1em;
        font-weight: 700;
        color: white;
        text-align: center;

        border: none;
        border-radius: 5px;
        cursor: pointer;
        display: block;
        width: 100%;
        margin: 0;
        padding: 10px 0;
        position: relative;

        transition-duration: 100ms;

        .label {
            z-index: 2;
            position: relative;
            user-select: none;
        }

        &.disabled {
            background-color: #181E29 !important;
            color: #A9AAA9;
            cursor: initial;
        }

        &:after {
            content: '';
            position: absolute;
            left: 0; top: 0;
            width: 100%; height: 100%;
            background-color: rgba(0, 0, 0, 0);
            transition-duration: 100ms;
        }

        &:not(.disabled) {
            &:hover {
                &:after {
                    background-color: rgba(0, 0, 0, 0.1);
                }
            }

            &:active {
                &:after {
                    background-color: rgba(0, 0, 0, 0.2);
                }
            }
        }
    }
</style>
