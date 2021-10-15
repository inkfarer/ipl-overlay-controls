<template>
    <div class="ipl-space">
        <slot />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'IplSpace'
});
</script>

<style lang="scss" scoped>
.ipl-space {
    background-color: #262F40;
    border-radius: 7px;
    padding: 8px;
}
</style>
