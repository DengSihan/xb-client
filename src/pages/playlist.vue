<template>
    <ul
        class="mb-8">
        <li
            v-for="{name, duration, category} in audios"
            class="mb-2 border-b p-2">
            <h2
                class="text-[90%] font-bold truncate my-1">
                {{ name }}
            </h2>
            <p
                class="-mx-2">
                <span class="text-[80%] font-mono mx-2">
                    {{ formatSeconds(duration) }}
                </span>
                <span class="text-[80%] mx-2">
                    {{ category === 1
                        ? '背景音乐'
                        : '促销音频' }}
                </span>
            </p>
        </li>
    </ul>
</template>

<script setup>
import { shallowRef, onBeforeMount } from 'vue';
import { useMeta } from 'vue-meta';
import { formatSeconds } from '~/utils/time.js';
import axios from '~/plugins/axios';

useMeta({
    title: '播放列表',
});

const audios = shallowRef([]);

onBeforeMount(async () => {
    const { data } = await axios.get('/audios');
    audios.value = data;
});

</script>