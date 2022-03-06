<template>
    <div
        v-if="Object.keys(recentErrors).length > 0"
        class="layout vertical center-horizontal"
    >
        <ipl-message
            v-for="(err, key, index) in recentErrors"
            :key="key"
            type="error"
            closeable
            class="error-message"
            :class="{'m-t-8': index > 0}"
            :data-test="`recent-error-${key}`"
            @close="removeMessage(key)"
        >
            <div class="max-width">
                {{ addDots(err.message ?? err, 256) }}
            </div>
        </ipl-message>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useErrorHandlerStore } from '../store/errorHandlerStore';
import { IplMessage } from '@iplsplatoon/vue-components';
import { addDots } from '../../helpers/stringHelper';

export default defineComponent({
    name: 'IplErrorDisplay',
    components: { IplMessage },
    setup() {
        const store = useErrorHandlerStore();

        if (!store) throw new Error('Missing error handler store.');

        return {
            recentErrors: computed(() => store.recentErrors),
            removeMessage(key: string) {
                store.removeRecentError({ key });
            },
            addDots
        };
    }
});
</script>

<style lang="scss">
.error-message {
    min-width: 236px;
    max-width: 272px;
}
</style>
