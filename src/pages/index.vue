<template>

    <main>
        {{ usePlatform() }}
    </main>

</template>

<script setup>
import { usePlatform } from '~/utils/platform.js';
import { useMeta } from 'vue-meta';

useMeta({
    title: '广播云',
    titleTemplate: false,
})
</script>
