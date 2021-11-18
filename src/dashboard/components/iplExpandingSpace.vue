<template>
    <div class="ipl-expansion-panel__content">
        <div class="ipl-expansion-panel__header layout horizontal center-vertical">
            <div
                class="ipl-expansion-panel__header-background"
                @click.self="handleHeaderClick"
            />
            <div class="ipl-expansion-panel__title">
                <slot name="title">
                    {{ title }}
                </slot>
            </div>
            <font-awesome-icon
                icon="chevron-left"
                class="icon"
                :class="{ 'content-expanded': shouldShowContent }"
            />
            <div class="header-extra">
                <slot name="header-extra" />
            </div>
        </div>
        <div
            v-show="shouldShowContent"
            class="content"
        >
            <slot />
        </div>
    </div>
</template>

<script lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { computed, defineComponent, getCurrentInstance, inject, ref, WritableComputedRef } from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft';

library.add(faChevronLeft);

export default defineComponent({
    name: 'IplExpandingSpace',

    components: {
        FontAwesomeIcon
    },

    props: {
        title: {
            type: String,
            default: ''
        }
    },

    emits: ['change'],

    setup() {
        const contentVisible = ref(false);
        const key = getCurrentInstance().vnode.key as string;
        const activeSpace = inject<WritableComputedRef<string>>('activeSpace', null);
        const isInGroup = activeSpace != null;
        const shouldShowContent = computed(() => isInGroup ? activeSpace.value === key : contentVisible.value);

        return {
            contentVisible,
            activeSpace,
            isInGroup,
            handleHeaderClick() {
                if (isInGroup) {
                    activeSpace.value = shouldShowContent.value ? null : key;
                } else {
                    contentVisible.value = !contentVisible.value;
                }
            },
            shouldShowContent
        };
    }
});
</script>

<style lang="scss" scoped>
@import './src/dashboard/styles/colors';
@import './src/dashboard/styles/constants';

.ipl-expansion-panel__content {
    background-color: $background-primary;
    border-radius: $border-radius-outer;
    position: relative;

    .ipl-expansion-panel__header {
        cursor: pointer;
        user-select: none;
        display: flex;
        padding: 8px;
        transition-duration: $transition-duration-low;
        border-radius: $border-radius-outer;
        position: relative;

        .icon {
            transition-duration: $transition-duration-low;
            justify-self: flex-end;
            margin: 0 5px;
            z-index: 1;
            position: relative;
            pointer-events: none;

            &.content-expanded {
                transform: rotate(-90deg);
            }
        }

        .ipl-expansion-panel__title {
            font-weight: 500;
            flex-grow: 1;
            z-index: 1;
            pointer-events: none;
        }

        .ipl-expansion-panel__header-background {
            position: absolute;
            width: 100%;
            height: 100%;
            left: 0; top: 0;
            border-radius: $border-radius-outer;
            z-index: 0;
            transition-duration: $transition-duration-low;

            &:hover {
                background-color: $background-primary-hover;
            }

            &:active {
                background-color: $background-primary-active;
            }
        }
    }

    .content {
        overflow: hidden;
        height: 100%;
        padding: 0 8px 8px;
    }
}
</style>
