<template>
    <a
        class="ipl-button"
        :style="buttonStyle"
        :class="{ disabled: disabled, 'has-icon': isIconButton }"
        @click="handleClick"
    >
        <span
            v-if="!isIconButton"
            class="label"
        >
            {{ label }}
        </span>
        <font-awesome-icon
            v-else
            :icon="icon"
            class="icon"
        />
    </a>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { buttonColors } from '../styles/colors';
import isEmpty from 'lodash/isEmpty';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

export default defineComponent({
    name: 'IplButton',

    components: {
        FontAwesomeIcon
    },

    props: {
        label: {
            type: String,
            default: null
        },
        icon: {
            type: [Array, String] as PropType<Array<string> | string>,
            default: null
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
        if (isEmpty(props.icon) && isEmpty(props.label)) {
            throw new Error('ipl-button requires an icon or label to be provided.');
        }

        return {
            buttonStyle: computed(() => ({
                backgroundColor: buttonColors[props.color]
            })),
            handleClick() {
                if (!props.disabled) {
                    emit('click');
                }
            },
            isIconButton: computed(() => props.icon != null)
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

        &.has-icon {
            font-size: 26px;
            width: 49px;
            padding: 4px 0 2px;
        }

        .label, .icon {
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
