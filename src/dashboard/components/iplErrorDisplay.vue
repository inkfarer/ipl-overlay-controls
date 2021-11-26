<template>
    <div
        v-if="Object.keys(recentErrors).length > 0"
        class="max-width layout vertical center-horizontal"
    >
        <ipl-message
            v-for="(err, key, index) in recentErrors"
            :key="key"
            type="error"
            closeable
            class="mw-2"
            :class="{'m-t-8': index > 0}"
            :data-test="`recent-error-${key}`"
            @close="removeMessage(key)"
        >
            {{ addDots(err.message ?? err, 256) }}
        </ipl-message>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useErrorHandlerStore } from '../store/errorHandlerStore';
import IplMessage from './iplMessage.vue';
import { addDots } from '../helpers/stringHelper';

export default defineComponent({
    name: 'IplErrorDisplay',
    components: { IplMessage },
    setup() {
        const store = useErrorHandlerStore();

        if (!store) throw new Error('Missing error handler store.');

        return {
            recentErrors: computed(() => store.state.recentErrors),
            removeMessage(key: string) {
                store.commit('removeRecentError', { key });
            },
            addDots
        };
    }
});
</script>
