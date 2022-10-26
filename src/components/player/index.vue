<template>

    <div
        id="player"
        class="h-24 px-6 border-t flex items-center justify-between relative">


        
    </div>

    <non-fixed-audios-player
        v-if="nonFixedAudios.length"
        ref="nonFixedAudiosPlayer"
        :audios="nonFixedAudios"/>

    <fixed-audios-player
        v-if="fixedAudios.length"
        ref="fixedAudiosPlayer"
        :audios="fixedAudios"/>

</template>

<script setup>

import { shallowRef, ref, computed, onBeforeMount, onBeforeUnmount } from 'vue';
import { randomIntFromInterval } from '~/utils/helpers.js';
import axios from '~/plugins/axios.js';

import FixedAudiosPlayer from '~/components/player/fixed-audios-player.vue';
import NonFixedAudiosPlayer from '~/components/player/non-fixed-audios-player.vue';


// ------------------原始音频数据，不是播放列表----------------------

// 这里只处理数据，不处理交互、逻辑

const audios = shallowRef([]);

const refreshAudios = async () => {
    const { data } = await axios.get('/audios');
    audios.value = data;
};

let audiosUpdater = null;

onBeforeMount(async () => {
    await refreshAudios();
    audiosUpdater = setInterval(
        refreshAudios,
        // 5分钟 ~ 10分钟 之间一个任意的一个毫秒数，为了避免多个门店同时请求造成高并发
        randomIntFromInterval(
            1000 * 60 * 5, // 5 分钟
            1000 * 60 * 10 // 10 分钟
        )
    );
});

onBeforeUnmount(() => {
    if (audiosUpdater) {
        clearInterval(audiosUpdater);
    }
});


const fixedAudios = computed(() => {
    return audios.value.filter(({ category }) => category === 2);
});

const nonFixedAudios = computed(() => {
    return audios.value.filter(({ category }) => category !== 2);
});

// --------------------------- 用户交互----------------------------

const nonFixedAudiosPlayer = ref(null);
const fixedAudiosPlayer = ref(null);

</script>

<script>
export default {
    inheritAttrs: false,
}
</script>