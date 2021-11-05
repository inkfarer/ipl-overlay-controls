<template>
    <a
        class="ipl-button"
        :style="buttonStyle"
        :class="{ disabled: disabledInternal, 'has-icon': isIconButton, 'small': small }"
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
        },
        requiresConfirmation: {
            type: Boolean,
            default: false
        },
        shortConfirmationMessage: {
            type: Boolean,
            default: false
        },
        small: {
            type: Boolean,
            default: false
        }
    },

    emits: ['click'],

    setup(props, { emit }) {
        if (isEmpty(props.icon) && isEmpty(props.label)) {
            throw new Error('ipl-button requires an icon or label to be provided.');
        }

        const instance = getCurrentInstance();
        let resetTimeout: number = null;
        let confirmationResetTimeout: number = null;
        const buttonState: Ref<'idle' | 'error' | 'success' | 'loading'> = ref('idle');
        const setState = (state: 'error' | 'success') => {
            buttonState.value = state;
            clearTimeout(resetTimeout);
            resetTimeout = window.setTimeout(() => {
                buttonState.value = 'idle';
            }, 5000);
        };
        const disabledInternal = computed(() => props.disabled || (props.async && buttonState.value === 'loading'));
        const colorInternal = computed(() => {
            const warningColor = props.color === 'red' ? 'orange' : 'red';
            if (props.requiresConfirmation && isClicked.value) return warningColor;

            switch (buttonState.value) {
                case 'error':
                    return warningColor;
                case 'success':
                    return props.color === 'green' ? 'green-success' : 'green';
                default:
                    return props.color;
            }
        });
        const isClicked = ref(false);

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
                    if (props.requiresConfirmation && !isClicked.value) {
                        isClicked.value = true;
                        confirmationResetTimeout = window.setTimeout(() => {
                            isClicked.value = false;
                        }, 5000);
                        return;
                    } else if (props.requiresConfirmation && isClicked.value) {
                        isClicked.value = false;
                        clearTimeout(confirmationResetTimeout);
                    }

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
                if (props.requiresConfirmation && isClicked.value) {
                    return props.shortConfirmationMessage ? 'Confirm?' : 'Are you sure?';
                }
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
            flex-grow: 0;
            font-size: 26px;
            width: 40px;
            min-width: 40px;
            height: 35px;
            padding: 5px 0 0;

            &.small {
                font-size: 20px;
                width: 30px;
                min-width: 30px;
                height: 27px;
                padding: 3px 0 0;
            }
        }

        &.small {
            font-size: 0.75em;
            padding: 7px 0;
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
