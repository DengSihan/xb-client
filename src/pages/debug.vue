<template>
    <div>
        <h1
            class="my-4 font-bold">
            上次响应时间
        </h1>
        <p>
            <time>
                {{ debugStore.info.last_response_time }}
            </time>
        </p>
        <h1
            class="my-4 font-bold">
            本次软件登录时间
        </h1>
        <p>
            {{ debugStore.info.last_login_time }}
        </p>
        <h1
            class="my-4 font-bold">
            上次版本检查时间
        </h1>
        <p>
            <time>
                {{ debugStore.info.last_version_check_time }}
            </time>
        </p>
    </div>
</template>


<script setup>
import { useMeta } from 'vue-meta';
import { useDebug } from '~/store/debug.js';

useMeta({
    title: '调试信息',
});

const debugStore = useDebug();
</script>
