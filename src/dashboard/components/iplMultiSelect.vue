<template>
    <div class="ipl-multi-select">
        <ipl-label>{{ label }}</ipl-label>
        <select
            ref="select"
            @change.stop="handleSelectChange"
        >
            <option
                v-for="option in options"
                :key="`option_${option.value}`"
                :value="option.value"
            >
                {{ option.name }}
            </option>
        </select>
        <div class="elem-display">
            <div
                v-for="option in modelValue"
                :key="option.value"
                class="option"
                @click="deselectOption(option.value)"
            >
                {{ option.name }}
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUpdated, PropType, Ref, ref, watch } from 'vue';
import { SelectOptions } from '../types/select';
import IplLabel from './iplLabel.vue';

export default defineComponent({
    name: 'IplMultiSelect',

    components: { IplLabel },

    props: {
        label: {
            type: String,
            required: true
        },
        options: {
            type: Array as PropType<SelectOptions>,
            required: true
        },
        modelValue: {
            type: [null, Array] as PropType<SelectOptions>,
            required: true
        }
    },

    emits: [ 'update:modelValue' ],

    setup(props, { emit }) {
        const select: Ref<HTMLSelectElement> = ref(null);

        onMounted(() => {
            select.value.selectedIndex = -1;
        });

        onUpdated(() => {
            select.value.selectedIndex = -1;
        });

        watch(() => props.options, newValue => {
            emit('update:modelValue', props.modelValue.filter(selectedOption =>
                newValue.some(option => option.value === selectedOption.value)));
        });

        return {
            handleSelectChange(event: Event) {
                const target = event.target as HTMLSelectElement;
                const selectedOption = target.options[target.selectedIndex];
                if (!props.modelValue?.some(option => option.value === selectedOption.value)) {
                    emit('update:modelValue', [
                        ...(props.modelValue ?? []),
                        { value: selectedOption.value, name: selectedOption.text }
                    ]);
                }
            },
            deselectOption(value: string) {
                emit('update:modelValue', props.modelValue.filter(option => option.value !== value));
            },
            select
        };
    }
});
</script>

<style lang="scss" scoped>
@import './src/dashboard/styles/colors';
@import './src/dashboard/styles/constants';

.ipl-multi-select {
    position: relative;
    cursor: pointer;
    transition-duration: $transition-duration-low;

    &:focus-within {
        .elem-display {
            border-color: $input-color-active;
        }

        label {
            color: $input-color-active;
        }
    }

    select {
        opacity: 0;
        width: 100%;
        height: 100%;
        position: absolute;
        cursor: pointer;
        z-index: 1;
        left: 0;
        top: 0;
        font-size: 1em;
    }

    .elem-display {
        border-bottom: 1px solid $input-color;
        min-height: 26px;
        display: flex;
        flex-wrap: wrap;
        position: relative;
        z-index: 2;
        pointer-events: none;
        padding-bottom: 16px;
        // chevron-down from font-awesome: https://fontawesome.com/v5.15/icons/chevron-down
        background-image: url("data:image/svg+xml,%3Csvg%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20448%20512%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M207.029%20381.476L12.686%20187.132c-9.373-9.373-9.373-24.569%200-33.941l22.667-22.667c9.357-9.357%2024.522-9.375%2033.901-.04L224%20284.505l154.745-154.021c9.379-9.335%2024.544-9.317%2033.901.04l22.667%2022.667c9.373%209.373%209.373%2024.569%200%2033.941L240.971%20381.476c-9.373%209.372-24.569%209.372-33.942%200z%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E");
        background-size: 16px 12px;
        background-repeat: no-repeat;
        background-position: right 3px bottom 5px;

        .option {
            background-color: $background-secondary;
            border-radius: 8px;
            font-size: 14px;
            padding: 2px 19px 2px 4px;
            margin: 2px;
            pointer-events: auto;
            background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512"><!-- Font Awesome Free 5.15.3 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) --><path fill="%23728EC2" d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"/></svg>');
            background-size: 14px 14px;
            background-repeat: no-repeat;
            background-position: right 3px center;
            transition-duration: $transition-duration-low;
            user-select: none;
            overflow-wrap: anywhere;

            &:hover {
                background-color: $background-secondary-hover;
            }

            &:active {
                background-color: $background-secondary-active;
            }
        }
    }
}
</style>
