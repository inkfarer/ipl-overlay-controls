<template>
    <div class="ipl-data-row layout horizontal">
        <ipl-label>{{ label }}</ipl-label>
        <div class="value">{{ value ?? '―' }}</div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import IplLabel from './iplLabel.vue';

export default defineComponent({
    name: 'IplDataRow',
    components: { IplLabel },
    props: {
        label: {
            type: String,
            required: true
        },
        value: {
            type: String,
            default: null
        }
    }
});
</script>

<style lang="scss" scoped>
    .ipl-data-row {
        border-bottom: 1px solid #737373;
        width: 100%;
        padding: 2px 0;
        margin-top: 6px;

        label {
            align-self: flex-end;
            flex-grow: 1;
            min-width: max-content;
        }

        .value {
            justify-self: flex-end;
            align-self: flex-end;
            text-align: right;
            overflow-wrap: anywhere;
        }
    }
</style>
