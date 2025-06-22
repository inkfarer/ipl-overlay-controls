<template>
    <ipl-error-display class="m-b-8" />
    <ipl-expanding-space :title="$t('sceneName.main')">
        <template #header-extra>
            <ipl-button
                class="show-scene-button m-l-8"
                :label="$t('showSceneButton')"
                color="green"
                data-test="show-main-button"
                :disabled="activeBreakScene === 'main'"
                @click="setActiveBreakScene('main')"
            />
        </template>
        <ipl-input
            v-model="mainFlavorText"
            :label="$t('mainScene.flavorTextInput')"
            name="break-main-flavor-text"
            @focuschange="handleMainFlavorTextFocus"
        />
        <div class="layout vertical center-horizontal">
            <div class="m-t-8">{{ $t('nextStageTimer.sectionTitle') }}</div>
            <next-stage-time-input
                v-model="nextRoundTime"
                data-test="next-stage-time-input"
                @focuschange="handleNextRoundTimeFocus"
            />
            <ipl-checkbox
                v-model="showNextRoundTime"
                class="m-t-8"
                :label="$t('nextStageTimer.showTimerCheckbox')"
            />
            <ipl-button
                class="m-t-8"
                :label="$t('common:button.update')"
                data-test="update-main-scene-button"
                :color="mainUpdateButtonColor"
                :title="$t('common:button.rightClickUndoMessage')"
                @click="updateMainScene"
                @right-click="undoMainScene"
            />
        </div>
    </ipl-expanding-space>
    <ipl-space class="layout horizontal center-vertical layout-break-scene m-t-8">
        <span>{{ $t('sceneName.teams') }}</span>
        <ipl-button
            class="show-scene-button"
            :label="$t('showSceneButton')"
            color="green"
            data-test="show-teams-button"
            :disabled="activeBreakScene === 'teams'"
            @click="setActiveBreakScene('teams')"
        />
    </ipl-space>
    <ipl-space class="layout horizontal center-vertical layout-break-scene m-t-8">
        <span>{{ $t('sceneName.stages') }}</span>
        <ipl-button
            class="show-scene-button"
            :label="$t('showSceneButton')"
            color="green"
            data-test="show-stages-button"
            :disabled="activeBreakScene === 'stages'"
            @click="setActiveBreakScene('stages')"
        />
    </ipl-space>
    <ipl-space
        v-for="scene in customScenes"
        :key="`show-scene-button__${scene.value}`"
        class="layout horizontal center-vertical layout-break-scene m-t-8"
    >
        <span>{{ scene.name }}</span>
        <ipl-button
            class="show-scene-button"
            :label="$t('showSceneButton')"
            color="green"
            :data-test="`show-scene-button__${scene.value}`"
            :disabled="activeBreakScene === scene.value"
            @click="setActiveBreakScene(scene.value)"
        />
    </ipl-space>
    <a
        v-if="hasMoreBundlesWithDeclaredScenes"
        href="/dashboard/#workspace/ipl%20setup"
        target="_top"
    >
        <ipl-space
            class="extra-layout-button m-t-8"
            clickable
        >
            {{ $t('sceneConfigLink') }}
        </ipl-space>
    </a>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { IplButton, IplSpace, IplExpandingSpace, IplInput, IplCheckbox } from '@iplsplatoon/vue-components';
import { useBreakScreenStore } from './breakScreenStore';
import { ActiveBreakScene } from 'schemas';
import isEqual from 'lodash/isEqual';
import NextStageTimeInput from './components/nextStageTimeInput.vue';
import IplErrorDisplay from '../components/iplErrorDisplay.vue';
import { useTranslation } from 'i18next-vue';

export default defineComponent({
    name: 'BreakScreen',

    components: { IplErrorDisplay, IplCheckbox, NextStageTimeInput, IplInput, IplExpandingSpace, IplButton, IplSpace },

    setup() {
        const i18n = useTranslation();
        const store = useBreakScreenStore();
        const mainFlavorText = ref('');
        const nextRoundTime = ref('');
        const nextRoundTimeFocused = ref(false);
        const mainFlavorTextFocused = ref(false);
        const isChanged = computed(() => !isEqual(mainFlavorText.value, store.mainFlavorText)
            || !isEqual(nextRoundTime.value, store.nextRoundStartTime.startTime));

        watch(() => store.mainFlavorText, newValue => {
            if (!mainFlavorTextFocused.value) {
                mainFlavorText.value = newValue;
            }
        }, { immediate: true });

        watch(() => store.nextRoundStartTime.startTime, newValue => {
            if (!nextRoundTimeFocused.value) {
                nextRoundTime.value = newValue;
            }
        }, { immediate: true });

        return {
            activeBreakScene: computed(() => store.activeBreakScene),
            mainFlavorText,
            nextRoundTime,
            showNextRoundTime: computed({
                get() {
                    return store.nextRoundStartTime.isVisible;
                },
                set(value: boolean) {
                    store.setNextRoundStartTimeVisible(value);
                }
            }),
            setActiveBreakScene(newValue: ActiveBreakScene) {
                store.setActiveBreakScene(newValue);
            },
            updateMainScene() {
                store.setMainFlavorText(mainFlavorText.value);
                store.setNextRoundStartTime(nextRoundTime.value);
            },
            undoMainScene(event: Event) {
                event.preventDefault();

                nextRoundTime.value = store.nextRoundStartTime.startTime;
                mainFlavorText.value = store.mainFlavorText;
            },
            mainUpdateButtonColor: computed(() => isChanged.value ? 'red' : 'blue'),
            handleMainFlavorTextFocus(event: boolean) {
                mainFlavorTextFocused.value = event;
            },
            handleNextRoundTimeFocus(event: boolean) {
                nextRoundTimeFocused.value = event;
            },
            mainFlavorTextFocused,
            nextRoundTimeFocused,
            hasMoreBundlesWithDeclaredScenes: computed(() => Object.keys(store.bundleDeclaredConfig)
                .some(bundleWithConfig => !store.runtimeConfig.activeGraphicsBundles
                    .some(activeBundle => activeBundle === bundleWithConfig))),
            customScenes: computed(() => {
                const result: { name: string, value: string }[] = [];

                store.runtimeConfig.activeGraphicsBundles.forEach(activeBundle => {
                    const declaredConfig = store.bundleDeclaredConfig[activeBundle];
                    if (declaredConfig != null) {
                        declaredConfig.scenes.forEach(scene => {
                            if (!result.some(otherScene => scene.value === otherScene.value)) {
                                result.push({
                                    value: scene.value,
                                    name: scene.names?.[i18n.i18next.language.toUpperCase()] ?? scene.value
                                });
                            }
                        });
                    }
                });

                return result;
            })
        };
    }
});
</script>

<style lang="scss" scoped>
.ipl-button.show-scene-button {
    width: 75px;
}

.layout-break-scene {
    font-weight: 500;

    span {
        flex-grow: 1;
    }
}

a {
    text-decoration: none !important;
}

.extra-layout-button {
    padding: 4px;
    text-align: center !important;
    color: var(--ipl-input-color) !important;
    font-size: 0.75em !important;
}
</style>
