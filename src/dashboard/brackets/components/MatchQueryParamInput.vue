<template>
    <div class="bracket-query-param-input">
        <match-query-number-range-input
            v-if="props.param.type === 'numberRange'"
            :min="props.param.min"
            :max="props.param.max"
            :model-value="props.query[props.param.key]"
            :label="$t(`bracketQueryParam.${props.param.key}`, props.param.name)"
            @update:model-value="emit('change', props.param.key, $event)"
        />
        <ipl-select
            v-else-if="props.param.type === 'select'"
            :model-value="props.query[props.param.key] == null ? null : String(props.query[props.param.key])"
            :label="$t(`bracketQueryParam.${props.param.key}`, props.param.name)"
            :options="props.param.options.map(option => 
                ({ name: option.name, value: String(option.value), originalValue: option.value }))"
            @update:model-value="onSelect"
        />
    </div>
    <template v-if="selectedOption != null">
        <match-query-param-input
            v-for="optionParam in params"
            :key="optionParam.key"
            :param="optionParam"
            :query="query"
            @change="(key, value) => emit('change', key, value)"
            @parameter-add="emit('parameterAdd', $event)"
            @parameter-remove="emit('parameterRemove', $event)"
            @loading="emit('loading', $event)"
        />
    </template>
</template>

<script setup lang="ts">
import type { MatchQueryParameter } from '@tourneyview/importer';
import { IplSelect } from '@iplsplatoon/vue-components';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import MatchQueryNumberRangeInput from './MatchQueryNumberRangeInput.vue';

const props = defineProps<{ param: MatchQueryParameter, query: Record<string, string | number> }>();
const emit = defineEmits<{
    (event: 'change', key: string, value: string | number): void
    (event: 'parameterAdd', key: string): void
    (event: 'parameterRemove', key: string): void
    (event: 'loading', loading: boolean): void
}>();

const params = ref<MatchQueryParameter[]>([]);
const selectedOption = computed(() => {
    if (props.param.type !== 'select') {
        return null;
    }

    return props.param.options.find(option => option.value === props.query[props.param.key]);
});

watch(selectedOption, async (newValue) => {
    params.value = [];
    if (newValue.getParams) {
        emit('loading', true);
        params.value = await newValue.getParams();
        emit('loading', false);
    }
});

function onSelect(newValue: string, details: Record<string, unknown>) {
    emit('change', props.param.key, <string | number>details.originalValue);
}

onMounted(() => {
    emit('parameterAdd', props.param.key);
    if (props.param.type === 'static') {
        emit('change', props.param.key, props.param.value);
    }
});

onUnmounted(() => {
    emit('change', props.param.key, undefined);
    emit('parameterRemove', props.param.key);
});
</script>

<style lang="scss" scoped>
.bracket-query-param-input {
    margin-top: 4px;
}
</style>
