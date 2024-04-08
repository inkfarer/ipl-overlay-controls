<template>
    <ipl-space
        clickable
        color="light"
        class="text-center caster-search__header"
        v-bind="$attrs"
        @click="searchOpen = !searchOpen"
    >
        <font-awesome-icon icon="search" /> {{ $t('casterSearch.buttonLabel') }}
    </ipl-space>
    <ipl-space
        v-if="searchOpen"
        color="light"
        class="caster-search__content"
    >
        <ipl-input
            v-model="searchQuery"
            :label="$t('casterSearch.queryInput')"
            name="caster-search-query"
            :loading="searchLoading"
            class="m-b-4"
        />
        <div
            v-if="Object.keys(searchResult).length <= 0"
            class="m-t-8 text-center"
        >
            {{ $t('casterSearch.noResultsMessage') }}
        </div>
        <template v-else>
            <ipl-space
                v-for="(caster, key) in searchResult"
                :key="key"
                clickable
                class="m-t-4 caster-option"
                color="light"
                @click="onSelect(caster)"
            >
                {{ caster.name }} <span class="badge badge-blue">{{ caster.pronouns }}</span>
            </ipl-space>
        </template>
    </ipl-space>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { IplSpace, IplInput } from '@iplsplatoon/vue-components';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch';
import debounce from 'lodash/debounce';
import { Caster, Casters } from 'schemas';
import { sendMessage } from '../../helpers/nodecgHelper';

library.add(faSearch);

export default defineComponent({
    name: 'CasterSearch',

    components: { IplInput, IplSpace, FontAwesomeIcon },

    emits: ['select'],

    setup(props, { emit }) {
        const minQueryLength = 2;
        const searchOpen = ref(false);
        const searchQuery = ref('');
        const searchResult = ref<Casters>({});
        const searchLoading = ref(false);

        const runSearch = debounce(async () => {
            searchLoading.value = true;
            try {
                searchResult.value = await sendMessage('searchCommentators', searchQuery.value);
            } finally {
                searchLoading.value = false;
            }
        }, 250);

        watch(searchQuery, runSearch);

        return {
            minQueryLength,
            searchOpen,
            searchQuery,
            searchResult,
            searchLoading,
            onSelect(caster: Caster) {
                emit('select', caster);
                searchOpen.value = false;
            }
        };
    }
});
</script>

<style lang="scss" scoped>
@import '../../styles/colors';
@import '../../styles/constants';

.caster-search__header {
    margin-top: 4px;
    z-index: 1000;
    position: relative;
}

.caster-search__content {
    flex-grow: 1;
    position: absolute;
    width: calc(100% - 16px);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    height: calc(100% - 12px);
    border-radius: $border-radius-inner;
    top: 4px;
    background-color: $background-secondary;
    z-index: 999;
    padding-top: 39px;
    overflow-y: auto;
}

.caster-option {
    padding: 4px 2px 4px 2px;
}
</style>
