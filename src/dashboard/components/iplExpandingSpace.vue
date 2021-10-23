<template>
    <div class="ipl-expansion-panel__content">
        <div
            class="ipl-expansion-panel__header layout horizontal center-vertical"
            @click.self="handleHeaderClick"
        >
            <div
                class="ipl-expansion-panel__title"
                @click="handleHeaderClick"
            >
                <slot name="title">
                    {{ title }}
                </slot>
            </div>
            <div @click="handleHeaderClick">
                <font-awesome-icon
                    icon="chevron-left"
                    class="icon"
                    :class="{ 'content-expanded': shouldShowContent }"
                />
            </div>
            <slot name="header-extra" />
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
.ipl-expansion-panel__content {
    background-color: #262F40;
    border-radius: 7px;
    position: relative;

    .ipl-expansion-panel__header {
        cursor: pointer;
        user-select: none;
        display: flex;
        padding: 8px;

        .icon {
            transition-duration: 100ms;
            justify-self: flex-end;
            margin: 0 5px;
        }

        .content-expanded {
            transform: rotate(-90deg);
        }

        .ipl-expansion-panel__title {
            font-weight: 500;
            flex-grow: 1;
        }
    }

    .content {
        overflow: hidden;
        height: 100%;
        padding: 0 8px 8px;
    }
}
</style>
