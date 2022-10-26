<template>

    <div
        id="player"
        class="h-24 px-6 border-t flex items-center justify-between relative">

        <!-- <button
            class="rounded-full btn h-12 w-12 text-white text-2xl shadow flex items-center justify-center"
            :class="{
                'bg-teal-600 hover:bg-teal-500 hover:scale-[102%] active:scale-[98%] scale-100 transition-[background,transform]': pauseable,
                'bg-slate-200 cursor-not-allowed': !pauseable
            }"
            type="button"
            @click="
                isPause
                    ? playNonFixedAudio()
                    : pauseNonFixedAudio()
            "
            :disabled="!pauseable"
            v-wave="pauseable">
            <i
                class="mdi"
                :class="{
                    'mdi-pause': !isPause,
                    'mdi-play': isPause
                }"></i>
        </button> -->

        <div
            class="w-[calc(100%-theme('space.16'))] relative top-1">
            
            <p
                class="flex mb-0.25 text-sm">
                <span
                    class="w-[calc(100%-theme('space.24'))] truncate">
                    {{ status.name }}
                </span>
                <span
                    class="w-24 whitespace-nowrap font-mono text-right">
                    {{ status.currentTime }} - {{ status.duration }}
                </span>
            </p>

            <input
                type="range"
                name="progress"
                class="w-full rounded-0 m-0 p-0 outline-none"
                min="0"
                max="1"
                step="0.00001"
                :value.lazy="status.progress"
                @change="changeProgressManually">

        </div>
        
    </div>

    <non-fixed-audios-player
        v-if="nonFixedAudios.length"
        ref="nonFixedAudiosPlayer"
        @statusupdate="statusupdate"
        :audios="nonFixedAudios"/>

    <fixed-audios-player
        v-if="fixedAudios.length"
        @statusupdate="statusupdate"
        ref="fixedAudiosPlayer"
        :audios="fixedAudios"/>

</template>

<script setup>

import { shallowRef, ref, computed, onBeforeMount, onBeforeUnmount, nextTick } from 'vue';
import { randomIntFromInterval } from '~/utils/helpers.js';
import { formatSeconds } from '~/utils/time.js';
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

// ----------------------------播放逻辑----------------------------

const nonFixedAudiosPlayer = ref(null);
const fixedAudiosPlayer = ref(null);

const status = shallowRef({
    name: '',
    progress: 0,
    currentTime: '00:00',
    duration: '00:00',
});

const changeProgressManually = ({ target }) => {
    nextTick(() => {
        setTimeout(() => {
            nonFixedAudiosPlayer.value.changeProgressManually(target.value);
        });
    });
}

const statusupdate = ({ currentTime, duration, name }) => {
    status.value = {
        name,
        progress: (currentTime / duration).toFixed(2),
        currentTime: formatSeconds(currentTime.toFixed(0)),
        duration: formatSeconds(duration.toFixed(0)),
    }
}

</script>

<script>
export default {
    inheritAttrs: false,
}
</script>