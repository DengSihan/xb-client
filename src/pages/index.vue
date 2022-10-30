<template>

    <h1
        class="text-2xl font-bold my-4">
        {{ store.company.name }}
    </h1>
    <h2
        class="text-lg font-bold my-4">
        {{ store.name }}
    </h2>
    <h3
        class="font-bold my-4">
        {{ store.code }}
    </h3>

</template>

<script setup>
import { useMeta } from 'vue-meta';
import { useAuth } from '~/store/auth.js';

useMeta({
    title: '广播云',
    titleTemplate: false,
});

const { store } = useAuth();
</script>
