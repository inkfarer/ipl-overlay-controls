<template>
    <ipl-button
        v-bind="$props"
        :progress-message="$t('common:button.loading')"
        :error-message="$t('common:button.error')"
        :success-message="$t('common:button.success')"
        :confirmation-message="props.shortConfirmationMessage
            ? $t('common:button.shortConfirmationMessage')
            : $t('common:button.confirmationMessage')"
    />
</template>

<script setup lang="ts">
import { IplButton } from '@iplsplatoon/vue-components';

type BaseProps = (typeof IplButton)['$props'];
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props extends /* @vue-ignore */ BaseProps { }

const props = defineProps<Props>();
</script>
