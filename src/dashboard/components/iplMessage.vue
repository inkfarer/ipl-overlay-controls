<template>
    <div
        class="ipl-message__wrapper layout horizontal center-vertical"
        :class="`ipl-message__type-${type}`"
    >
        <font-awesome-icon
            class="icon"
            :icon="icon"
        />
        <div class="message-content">
            <slot />
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons/faInfoCircle';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons/faExclamationTriangle';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons/faExclamationCircle';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faInfoCircle, faExclamationTriangle, faExclamationCircle);

export default defineComponent({
    name: 'IplMessage',

    components: { FontAwesomeIcon },

    props: {
        type: {
            type: String as PropType<'error' | 'info' | 'warning'>,
            required: true,
            validator: (value: string): boolean => {
                return ['error', 'info', 'warning'].includes(value);
            }
        }
    },

    setup(props) {
        return {
            icon: computed(() => {
                switch (props.type) {
                    case 'info':
                        return 'info-circle';
                    case 'error':
                        return 'exclamation-circle';
                    case 'warning':
                        return 'exclamation-triangle';
                    default:
                        throw new Error(`No icon found for type '${props.type}'`);
                }
            })
        };
    }
});
</script>

<style lang="scss" scoped>
.ipl-message__wrapper {
    border-radius: 7px;
    border-width: 2px;
    border-style: solid;
    padding: 8px;

    > .icon {
        font-size: 25px;
        margin-right: 8px;
    }

    &.ipl-message__type-info {
        border-color: rgb(62, 98, 240);
        background-color: rgba(62, 98, 240, 0.1);
    }

    &.ipl-message__type-warning {
        border-color: rgb(253, 216, 53);
        background-color: rgba(253, 216, 53, 0.1);
    }

    &.ipl-message__type-error {
        border-color: rgb(231, 78, 54);
        background-color: rgba(231, 78, 54, 0.1);
    }
}
</style>
