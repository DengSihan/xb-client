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
    <div
        class="text-sm">
        <label
            class="my-2"
            for="last-response-at">
            上次响应时间
        </label>
        <p
            class="my-2"
            id="last-response-at">
            <time>
                {{ debugStore.info.last_response_time }}
            </time>
        </p>
        <label
            class="my-2"
            for="last-login-at">
            本次登录时间
        </label>
        <p
            class="my-2"
            id="last-login-at">
            <time>
                {{ debugStore.info.last_login_time }}
            </time>
        </p>
        <label
            class="my-2"
            for="last-version-check-at">
            上次版本检查
        </label>
        <p
            class="my-2"
            id="last-version-check-at">
            <time>
                {{ debugStore.info.last_version_check_time }}
            </time>
        </p>
    </div>
</template>

<script setup>
import { useMeta } from 'vue-meta';
import { useAuth } from '~/store/auth.js';
import { useDebug } from '~/store/debug.js';

const debugStore = useDebug();

useMeta({
    title: '广播云',
    titleTemplate: false,
});

const { store } = useAuth();
</script>
