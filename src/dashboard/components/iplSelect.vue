<template>
    <div
        class="ipl-select__wrapper"
        :class="{disabled}"
    >
        <ipl-label>
            {{ label }}
            <select
                v-model="model"
                :disabled="disabled"
            >
                <template v-if="!!options">
                    <option
                        v-for="option in options"
                        :key="`option_${option.value}`"
                        :value="option.value"
                        :disabled="option.disabled"
                    >
                        {{ option.name }}
                    </option>
                </template>
                <template v-else>
                    <optgroup
                        v-for="(group, groupIndex) in optionGroups"
                        :key="`optgroup_${groupIndex}`"
                        :label="group.name"
                    >
                        <option
                            v-for="(option, optionIndex) in group.options"
                            :key="`option_${groupIndex}_${optionIndex}`"
                            :value="option.value"
                            :disabled="option.disabled"
                        >
                            {{ option.name }}
                        </option>
                    </optgroup>
                </template>
            </select>
        </ipl-label>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import IplLabel from './iplLabel.vue';
import { SelectOptionGroups, SelectOptions } from '../types/select';

export default defineComponent({
    name: 'IplSelect',

    components: { IplLabel },

    props: {
        label: {
            type: String,
            default: null
        },
        options: {
            type: Array as PropType<SelectOptions>,
            default: null
        },
        optionGroups: {
            type: Array as PropType<SelectOptionGroups>,
            default: null
        },
        modelValue: {
            type: [ String, null ],
            required: true
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },

    emits: [ 'update:modelValue' ],

    setup(props, { emit }) {
        if (!props.options && !props.optionGroups) {
            throw new Error('ipl-select requires either options or option groups to be set.');
        }

        return {
            model: computed({
                get() {
                    return props.modelValue;
                },
                set(value) {
                    emit('update:modelValue', value);
                }
            })
        };
    }
});
</script>

<style lang="scss" scoped>
@import './src/dashboard/styles/colors';

.ipl-select__wrapper {
    border-bottom: 1px solid $input-color;
    width: 100%;

    &.disabled select {
        color: $text-color-disabled;
        pointer-events: none;
    }
}

select {
    background-color: transparent;
    border: 0;
    width: 100%;
    color: $text-color;
    font-size: 16px;
    font-family: 'Roboto', sans-serif;
    outline: 0;
    padding: 0 20px 0 2px;
    margin: 2px 0;
    // chevron-down from font-awesome: https://fontawesome.com/v5.15/icons/chevron-down
    background-image: url("data:image/svg+xml,%3Csvg%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20448%20512%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M207.029%20381.476L12.686%20187.132c-9.373-9.373-9.373-24.569%200-33.941l22.667-22.667c9.357-9.357%2024.522-9.375%2033.901-.04L224%20284.505l154.745-154.021c9.379-9.335%2024.544-9.317%2033.901.04l22.667%2022.667c9.373%209.373%209.373%2024.569%200%2033.941L240.971%20381.476c-9.373%209.372-24.569%209.372-33.942%200z%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E");
    background-size: 16px 12px;
    background-repeat: no-repeat;
    background-position: right 3px center;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
}

option,
optgroup {
    color: black;
}
</style>
