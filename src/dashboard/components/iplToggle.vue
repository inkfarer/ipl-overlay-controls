<template>
    <div
        class="ipl-toggle__container layout horizontal center-horizontal"
        @click="toggleValue"
    >
        <div class="ipl-toggle__text">
            <span
                class="true-option"
                :class="{ selected: model }"
            >
                Show
            </span>
            <span
                class="false-option"
                :class="{ selected: !model }"
            >
                Hide
            </span>
        </div>
        <div
            class="ipl-toggle__button"
            :class="{ 'is-true': model }"
        />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

export default defineComponent({
    name: 'IplToggle',

    props: {
        modelValue: {
            type: Boolean,
            default: false
        }
    },

    emits: [ 'update:modelValue' ],

    setup(props, { emit }) {
        const model = computed({
            get() {
                return props.modelValue;
            },
            set(value) {
                emit('update:modelValue', value);
            }
        });
        return {
            model,
            toggleValue() {
                model.value = !model.value;
            }
        };
    }
});
</script>

<style lang="scss" scoped>
    @import './src/dashboard/styles/colors';

    .ipl-toggle__container {
        height: 44px;
        background-color: #181E29;
        border-radius: 7px;
        position: relative;
        cursor: pointer;

        .ipl-toggle__text {
            display: grid;
            grid-template-columns: 1fr 1fr;
            height: 100%;
            width: 100%;
            align-items: center;
            justify-items: center;
            z-index: 2;
            text-transform: uppercase;
            font-size: 1em;
            font-weight: 700;
            user-select: none;

            span {
                color: #A9AAA9;
                transition-duration: 250ms;

                &.selected {
                    color: white;
                }
            }
        }

        .ipl-toggle__button {
            position: absolute;
            height: calc(100% - 4px);
            width: calc(50% - 4px);
            background-color: $red;
            left: calc(50% + 2px);
            top: 2px;
            border-radius: 5px;
            z-index: 1;
            transition-duration: 250ms;

            &.is-true {
                // Fixes oddities with Safari on iOS
                left: calc(0% + 2px);
                background-color: $green;
            }
        }
    }
</style>
