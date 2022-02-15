<template>
    <div class="layout vertical center-horizontal">
        <ipl-space class="width-cap">
            <div class="title">IPL-OC obs-integrator</div>
            <div>
                Integrates with OBS Studio to automate common tasks during broadcast.
            </div>
        </ipl-space>
    </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core';
import { IplSpace } from '@iplsplatoon/vue-components';

export default defineComponent({
    name: 'ObsIntegrator',

    components: { IplSpace }
});
</script>
