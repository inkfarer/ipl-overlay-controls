<template>
    <div class="unknown-stage-select">
        <div
            v-for="item in unknownStages"
            :key="`unknown-stage-select_${item.index}`"
        >
            <div class="separator">
                <span>
                    {{ $t('common:nextRoundUnknownStageSelect.gameSeparatorLabel', { index: item.index + 1 }) }}
                </span>
            </div>
            <mode-select
                :label="$t('common:nextRoundUnknownStageSelect.unknownModeSelectLabel')"
                :model-value="item.mode"
                @update:model-value="emit('update:mode', { index: item.index, mode: $event })"
            />
            <stage-select
                :label="$t('common:nextRoundUnknownStageSelect.unknownStageSelectLabel')"
                class="m-t-4"
                :model-value="item.stage"
                @update:model-value="emit('update:stage', { index: item.index, stage: $event })"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { Round } from 'schemas';
import { computed } from 'vue';
import ModeSelect from './ModeSelect.vue';
import StageSelect from './StageSelect.vue';

const props = defineProps<{
    round: Round
}>();

const emit = defineEmits<{
    (event: 'update:stage', newValue: { index: number, stage: string }): void
    (event: 'update:mode', newValue: { index: number, mode: string }): void
}>();

const unknownStages = computed(() => props.round.games
    .map((game, i) => ({ ...game, index: i }))
    .filter(game => game.stage === 'Unknown Stage'));
</script>

<style scoped lang="scss">
@use './src/dashboard/styles/colors';

.separator {
    width: 100%;
    text-align: center;
    border-bottom: 1px solid colors.$text-color;
    color: colors.$text-color;
    line-height: 0.1em;
    margin: 14px 0 10px;
    user-select: none;
}

.separator span {
    background: colors.$background-primary;
    padding: 0 10px;
}
</style>
