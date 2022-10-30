<template>
    <audio
        ref="player"
        :key="audio?.url"
        @timeupdate="timeupdate"
        @ended="ended">
        <source
            v-if="audio.url"
            type="audio/mpeg"
            :src="audio.url">
    </audio>

</template>

<script setup>

import { onMounted, onBeforeUnmount ,nextTick, ref, computed, watchPostEffect } from 'vue';
import { getCurrentUnixtime } from '~/utils/time.js';
import { useFixedAudios } from '~/composables/player.js';
import { useSettings } from '~/store/settings.js';

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

const {
    getSchedule,
} = useFixedAudios(props);

const player = ref(null), // this.$refs.audio DOM 对象
    audio = ref({}); // 正在播放的音频

const play = () => {
    nextTick(() => {
        emits('update:isPlayingFixedAudios', true);
        player.value
            .play()
            .then(() => {
                emits('update:autoplayPolicy', {
                    show: false,
                    play: () => {}
                });
            })
            .catch(() => {
                emits('update:autoplayPolicy', {
                    show: true,
                    play,
                });
            });
    });
};

const ended = () => {
    emits('update:isPlayingFixedAudios', false);
    emits('update-status', {
        name: '',
        currentTime: 0,
        duration: 0,
    });
};

// 轮询检查当前是否应该播放固定播音
let shouldPlayFixedAudioChecker = null;

onMounted(() => {
    nextTick(() => {
        shouldPlayFixedAudioChecker = setInterval(() => {

            let currentUnixtime = getCurrentUnixtime().toString(),
                audiosSchedule = getSchedule(props.audios);

            if (
                Object.keys(audiosSchedule).includes(currentUnixtime)
                && !props.isPlayingFixedAudio
            ) {
                audio.value = audiosSchedule[currentUnixtime];
                play();
            }

        }, 1000);
    });
});

onBeforeUnmount(() => {
    if (shouldPlayFixedAudioChecker) {
        clearInterval(shouldPlayFixedAudioChecker);
    }
});

const settingsStore = useSettings();
const volume = computed(() => settingsStore.settings.nonfixed_audios_volume);

watchPostEffect(
    () => {
        player.value.volume = volume.value;
    }
);

defineExpose({
    play,
});

</script>