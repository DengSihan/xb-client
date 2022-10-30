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
                    ? isPauseByUser = false
                    : isPauseByUser = true;
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
                    {{ 
                        isPlayingFixedAudios
                            ? status?.name
                            : (isOpen ? status.name : '休息中')
                    }}
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
        v-model:isPause="isPause"
        v-model:isPauseByUser="isPauseByUser"
        v-model:autoplayPolicy="autoplayPolicy"
        :audios="nonFixedAudios"
        :is-playable="nonFixedAudiosPlayable"
        @update-status="updateStatus"/>

    <fixed-audios-player
        v-if="fixedAudios.length"
        ref="fixedAudiosPlayer"
        v-model:autoplayPolicy="autoplayPolicy"
        v-model:isPlayingFixedAudios="isPlayingFixedAudios"
        :audios="fixedAudios"
        @update-status="updateStatus"/>

    <dialog-for-autoplay-policy
        :show="autoplayPolicy.show"
        @interact="autoplayPolicy.play()"/>

</template>

<script setup>
import { ref, nextTick, computed } from 'vue';

import { useIsOpen, useAudio, useStatus } from '~/composables/player.js';

import DialogForAutoplayPolicy from '~/components/player/dialog-for-autoplay-policy.vue';
import NonFixedAudiosPlayer from '~/components/player/non-fixed-audios-player.vue';
import FixedAudiosPlayer from '~/components/player/fixed-audios-player.vue';

const isPause = ref(false),
    isPlayingFixedAudios = ref(false),
    isPauseByUser = ref(false);

// 是否处于营业时间
const isOpen = useIsOpen();

const isPauseable = computed(() => {
    return isOpen.value && !isPlayingFixedAudios.value;
})

// 非固定音频与固定音频原始文件
const {
    nonFixedAudios,
    fixedAudios,
} = useAudio();

// 播放状态
const {
    status,
    updateStatus
} = useStatus();

// 浏览器禁止自动播放
const autoplayPolicy = ref({
    show: false,
    play: () => {}
});

// 非固定音频播放器
const nonFixedAudiosPlayer = ref(null);

// 手动改变进度条
const changeProgressManually = ({ target }) => {
    nextTick(() => {
        setTimeout(() => {
            nonFixedAudiosPlayer.value.changeProgressManually(target.value);
        });
    });
}

const playNonFixedAudios = () => {
    nonFixedAudiosPlayer.value.play();
}

const pauseNonFixedAudios = () => {
    nonFixedAudiosPlayer.value.pause();
}

const nonFixedAudiosPlayable = computed(() => {
    return isOpen.value && !isPlayingFixedAudios.value;
});

</script>