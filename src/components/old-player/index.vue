<template>

    <div
        id="player"
        class="h-24 px-6 border-t flex items-center justify-between relative">

        <button
            class="rounded-full btn h-12 w-12 text-white text-2xl shadow flex items-center justify-center"
            :class="{
                'bg-teal-600 hover:bg-teal-500 hover:scale-[102%] active:scale-[98%] scale-100 transition-[background,transform]': isPauseable,
                'bg-slate-200 cursor-not-allowed': !isPauseable
            }"
            type="button"
            @click="
                isPause
                    ? playNonFixedAudios()
                    : pauseNonFixedAudios()
            "
            :disabled="!isPauseable"
            v-wave="isPauseable">
            <i
                class="mdi"
                :class="{
                    'mdi-pause': !isPause,
                    'mdi-play': isPause
                }"></i>
        </button>

        <div
            class="w-[calc(100%-theme('space.16'))] relative top-1">
            
            <p
                class="flex mb-0.25 text-sm">
                <span
                    class="w-[calc(100%-theme('space.36'))] truncate">
                    {{ isOpen ? status.name : '休息中' }}
                </span>
                <span
                    class="w-36 whitespace-nowrap font-mono text-right">
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
                @change="changeProgressManually"
                :disabled="!isPauseable">

        </div>
        
    </div>

    <non-fixed-audios-player
        v-if="nonFixedAudios.length"
        ref="nonFixedAudiosPlayer"
        :is-open="isOpen"
        :is-playing-fixed-audios="isPlayingFixedAudios"
        v-model:isPause="isPause"
        @statusupdate="statusupdate"
        :audios="nonFixedAudios"/>

    <!-- <fixed-audios-player
        v-if="fixedAudios.length"
        ref="fixedAudiosPlayer"
        v-model:isPlayingFixedAudios="isPlayingFixedAudios"
        @statusupdate="statusupdate"
        :audios="fixedAudios"/> -->

</template>

<script setup>

import { shallowRef, ref, computed, onBeforeMount, onBeforeUnmount, nextTick } from 'vue';
import { randomIntFromInterval } from '~/utils/helpers.js';
import { formatSeconds, getCurrentUnixtime, getUnixtimeFromDatetime } from '~/utils/time.js';
import axios from '~/plugins/axios.js';
import { useAuth } from '~/store/auth.js';

import FixedAudiosPlayer from '~/components/player/fixed-audios-player.vue';
import NonFixedAudiosPlayer from '~/components/player/non-fixed-audios-player.vue';

// -------------------- 当前门店信息 -----------------------------

const auth = useAuth();

// 是否处于营业时间
const isOpen = ref(false);

// 是否营业更新器，用于检查当前是否处于营业时间
let isOpenUpdater = null;

const refreshIsOpen = () => {

    let currentUnixtime = getCurrentUnixtime(),
        open_at = auth.store.open_at,
        close_at = auth.store.close_at;

    isOpen.value = currentUnixtime >= getUnixtimeFromDatetime(open_at)
        && currentUnixtime <= getUnixtimeFromDatetime(close_at);
}

onBeforeMount(() => {
    refreshIsOpen();
    isOpenUpdater = setInterval(() => {
        refreshIsOpen();
    }, 1000);
});

onBeforeUnmount(() => {
    if (isOpenUpdater) {
        clearInterval(isOpenUpdater);
    }
});

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

// 非固定播音只在营业时间内播放，固定播音在营业时间内和营业时间外都会播放，固定播音的播放时间只由它的 play_at 属性决定
// 用户的控制操作（暂停、改变进度条）都只能影响非固定播音，固定播音不受此控制器影响

const nonFixedAudiosPlayer = ref(null);
const fixedAudiosPlayer = ref(null);

const isPause = ref(false);
const isPlayingFixedAudios = ref(false);

const isPauseable = computed(() => {
    return isOpen.value
        && !isPlayingFixedAudios.value;
});

const status = shallowRef({
    name: '加载中...',
    progress: 0,
    currentTime: '00:00',
    duration: '00:00',
});

// 手动改变进度条
const changeProgressManually = ({ target }) => {
    nextTick(() => {
        setTimeout(() => {
            nonFixedAudiosPlayer.value.changeProgressManually(target.value);
        });
    });
}

// 类似浏览器 audio 原生事件 timeupdate，只用于状态字段的更新
const statusupdate = ({ currentTime, duration, name }) => {
    status.value = {
        name,
        progress: (currentTime / duration).toFixed(2),
        currentTime: formatSeconds(currentTime.toFixed(0)),
        duration: formatSeconds(duration.toFixed(0)),
    }
}

const playNonFixedAudios = () => {
    nextTick(() => {
        setTimeout(() => {
            isPause.value = false;
            nonFixedAudiosPlayer.value.play();
        });
    });
}

const pauseNonFixedAudios = () => {
    nextTick(() => {
        setTimeout(() => {
            isPause.value = true;
            nonFixedAudiosPlayer.value.pause();
        });
    });
}

</script>

<script>
export default {
    inheritAttrs: false,
}
</script>