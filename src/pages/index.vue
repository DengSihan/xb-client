<template>

    <main>
        {{ usePlatform() }}
    </main>

</template>

<script setup>
import { usePlatform } from '~/utils/platform.js';
</script>
