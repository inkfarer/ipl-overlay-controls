<template>
    <a
        class="ipl-button"
        :style="buttonStyle"
        :class="{ disabled: disabledInternal, 'has-icon': isIconButton }"
        @click="handleClick"
    >
        <span
            v-if="!isIconButton"
            class="label"
        >
            {{ labelInternal }}
        </span>
        <font-awesome-icon
            v-else
            :icon="icon"
            class="icon"
        />
    </a>
</template>

<script lang="ts">
import { computed, defineComponent, getCurrentInstance, PropType, Ref, ref } from 'vue';
import { buttonColors } from '../styles/colors';
import isEmpty from 'lodash/isEmpty';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { getContrastingTextColor } from '../helpers/colorHelper';

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
        },
        async: {
            type: Boolean,
            default: false
        },
        progressMessage: {
            type: String,
            default: 'Working...'
        },
        successMessage: {
            type: String,
            default: 'Done!'
        }
    },

    emits: ['click'],

    setup(props, { emit }) {
        if (isEmpty(props.icon) && isEmpty(props.label)) {
            throw new Error('ipl-button requires an icon or label to be provided.');
        }

        const instance = getCurrentInstance();
        const resetTimeout: Ref<number> = ref(null);
        const buttonState: Ref<'idle' | 'error' | 'success' | 'loading'> = ref('idle');
        const setState = (state: 'error' | 'success') => {
            buttonState.value = state;
            clearTimeout(resetTimeout.value);
            resetTimeout.value = window.setTimeout(() => {
                buttonState.value = 'idle';
            }, 5000);
        };
        const disabledInternal = computed(() => props.disabled || (props.async && buttonState.value === 'loading'));
        const colorInternal = computed(() => {
            switch (buttonState.value) {
                case 'error':
                    return props.color === 'red' ? 'orange' : 'red';
                case 'success':
                    return props.color === 'green' ? 'green-success' : 'green';
                default:
                    return props.color;
            }
        });

        return {
            buttonStyle: computed(() => {
                const buttonColor = buttonColors[colorInternal.value];
                return ({
                    backgroundColor: buttonColor,
                    color: disabledInternal.value ? '#A9AAA9' : getContrastingTextColor(buttonColor)
                });
            }),
            async handleClick() {
                if (!disabledInternal.value) {
                    if (!props.async) {
                        emit('click');
                    } else {
                        try {
                            buttonState.value = 'loading';
                            await instance.vnode.props.onClick();
                            setState('success');
                        } catch (e) {
                            console.error(e);
                            setState('error');
                        }
                    }
                }
            },
            buttonState,
            isIconButton: computed(() => props.icon != null),
            disabledInternal,
            labelInternal: computed(() => {
                if (!props.async) return props.label;

                switch (buttonState.value) {
                    case 'error':
                        return 'Error!';
                    case 'loading':
                        return props.progressMessage;
                    case 'success':
                        return props.successMessage;
                    default:
                        return props.label;
                }
            })
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
