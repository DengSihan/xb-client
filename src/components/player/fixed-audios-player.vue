<template>
    <audio
        ref="player"
        :key="audio?.url"
        @timeupdate="timeupdate"
        @ended="ended"
        @pause="pauseBySystem"
        @play="playBySystem">
        <source
            v-if="audio.url"
            type="audio/mpeg"
            :src="audio.url">
    </audio>

</template>

<script setup>

import { onMounted, onBeforeUnmount ,nextTick, ref, watch } from 'vue';
import { getCurrentUnixtime } from '~/utils/time.js';
import { useFixedAudios } from '~/composables/player.js';

const props = defineProps({
    audios: {
        type: Array,
        required: true,
    },
    autoplayPolicy: {
        type: Object,
        required: true,
    },
    isPlayingFixedAudios: {
        type: Boolean,
        required: true,
    },
});

const emits = defineEmits([
    'update-status',
    'update:autoplayPolicy',
    'update:isPlayingFixedAudios',
]);

const timeupdate = ({ target }) => {
    emits('update-status', {
        name: audio.value.name,
        currentTime: target.currentTime,
        duration: target.duration,
    });
};

// 由系统暂停，而非点击页面中的暂停按钮：比如点击 ubuntu 通知栏中的暂停
const pauseBySystem = e => {
    play();
}
const playBySystem = e => {
    e.preventDefault();
}

const {
    getSchedule,
} = useFixedAudios(props);

const player = ref(null), // this.$refs.audio DOM 对象
    audio = ref({}); // 正在播放的音频

const play = () => {
    emits('update:isPlayingFixedAudios', true);
    nextTick(() => {
        if (
            !props.isPlayingFixedAudios
        ) {
            player.value
                .play()
                .then(() => {
                    emits('update:autoplayPolicy', {
                        show: false,
                        play: () => {}
                    });
                })
                .catch(() => {

                    console.log('trigger by fixed player');

                    emits('update:autoplayPolicy', {
                        show: true,
                        play,
                    });
                });
        }
    });
};

const ended = () => {
    emits('update:isPlayingFixedAudios', false);
};

// 轮询检查当前是否应该播放固定播音
let shouldPlayFixedAudioChecker = null;

onMounted(() => {
    nextTick(() => {
        shouldPlayFixedAudioChecker = setInterval(() => {

            let currentUnixtime = getCurrentUnixtime().toString(),
                sudiosSchedule = getSchedule();

            if (
                Object.keys(sudiosSchedule).includes(currentUnixtime)
                && !props.isPlayingFixedAudio
            ) {
                audio.value = sudiosSchedule[currentUnixtime];
                play();
            }

        }, 1000)
    });
});

onBeforeUnmount(() => {
    if (shouldPlayFixedAudioChecker) {
        clearInterval(shouldPlayFixedAudioChecker);
    }
});

defineExpose({
    play,
});

</script>