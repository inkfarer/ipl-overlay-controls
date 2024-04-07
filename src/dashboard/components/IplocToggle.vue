<template>
    <ipl-toggle
        v-bind="$props"
        :true-label="$t('common:largeToggle.show')"
        :false-label="$t('common:largeToggle.hide')"
    />
</template>

<script setup lang="ts">
import { IplToggle } from '@iplsplatoon/vue-components';

type BaseProps = (typeof IplToggle)['$props'];
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props extends /* @vue-ignore */ BaseProps { }

defineProps<Props>();
</script>
