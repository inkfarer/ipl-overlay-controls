<template>
    <transition
        name="sidebar-transition"
        :duration="250"
    >
        <div
            v-if="isOpen"
            class="ipl-sidebar__wrapper"
        >
            <div
                class="background"
                @click="close"
            />
            <div class="content">
                <slot />
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'IplSidebar',

    props: {
        isOpen: {
            type: Boolean,
            required: true
        }
    },

    emits: ['update:isOpen'],

    setup(props, { emit }) {
        return {
            close() {
                emit('update:isOpen', false);
            }
        };
    }
});
</script>

<style lang="scss" scoped>
@import './src/dashboard/styles/colors';
@import './src/dashboard/styles/constants';

.ipl-sidebar__wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 100;

    .background {
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        z-index: 101;
        background-color: rgba(0, 0, 0, 0.5);
    }

    .content {
        width: 85%;
        height: calc(100% - 16px);
        position: absolute;
        //noinspection CssRedundantUnit; Fixes issues on iOS Safari
        left: 0%;
        top: 0;
        z-index: 102;
        background-color: $background-primary;
        padding: 8px;
        overflow-y: auto;
    }
}

.sidebar-transition-enter-active {
    .background {
        transition: opacity $transition-duration-med ease-out;
    }

    .content {
        transition: left $transition-duration-med ease-out;
    }
}

.sidebar-transition-leave-active {
    .background {
        transition: opacity $transition-duration-med ease-in;
    }

    .content {
        transition: left $transition-duration-med ease-in;
    }
}

.sidebar-transition-enter-from,
.sidebar-transition-leave-to {
    .background {
        opacity: 0;
    }

    .content {
        left: -85%;
    }
}
</style>
