<template>
    <ipl-space>
        <div class="title">Last.fm</div>
        <ipl-input
            v-model="settings.username"
            name="username"
            label="Username"
            @focuschange="handleFocusEvent"
        />
        <ipl-button
            label="Update"
            class="m-t-8"
            :color="buttonColor"
            data-test="update-button"
            @click="handleUpdate"
        />
    </ipl-space>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref } from 'vue';
import IplInput from '../../components/iplInput.vue';
import IplSpace from '../../components/iplSpace.vue';
import IplButton from '../../components/iplButton.vue';
import { useSettingsStore } from '../settingsStore';
import isEqual from 'lodash/isEqual';
import { LastFmSettings } from 'schemas';
import cloneDeep from 'lodash/cloneDeep';

export default defineComponent({
    name: 'LastfmSettings',

    components: {
        IplButton,
        IplInput,
        IplSpace
    },

    setup() {
        const isFocused = ref(false);
        const isChanged = computed(() => !isEqual(settings.value, store.state.lastFmSettings));
        const store = useSettingsStore();
        const settings: Ref<LastFmSettings> = ref(cloneDeep(store.state.lastFmSettings));

        store.watch(store => store.lastFmSettings, (newValue) => {
            if (!isFocused.value) {
                settings.value = cloneDeep(newValue);
            }
        }, { deep: true });

        return {
            focused: isFocused,
            handleFocusEvent(event: boolean) {
                isFocused.value = event;
            },
            isChanged,
            buttonColor: computed(() => isChanged.value ? 'red' : 'blue'),
            settings,
            handleUpdate() {
                if (isChanged.value) {
                    store.commit('setLastFmSettings', { newValue: settings.value });
                }
            },
        };
    }
});
</script>

<style scoped>

</style>
