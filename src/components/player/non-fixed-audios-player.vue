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

import { onMounted, shallowRef, nextTick, ref, watch } from 'vue';
import { useNonFixedAudios } from '~/composables/player.js';

const props = defineProps({
    audios: {
        type: Array,
        required: true,
    },
    autoplayPolicy: {
        type: Object,
        required: true,
    },
    isPause: {
        type: Boolean,
        required: true,
    },
    isPlayable: {
        type: Boolean,
        required: true,
    }
});

const emits = defineEmits([
    'update-status',
    'update:autoplayPolicy',
    'update:isPause',
]);

const playlist = shallowRef([]),
    audio = shallowRef({}),
    player = ref(null),
    currentPlayIndex = ref(0);

const {
    getPlaylist,
} = useNonFixedAudios(props);


const play = () => {
    if (props.isPlayable) {
        nextTick(() => {
            player.value
                .play()
                .then(() => {
                    emits('update:isPause', false);
                    emits('update:autoplayPolicy', {
                        show: false,
                        play: () => {}
                    });
                })
                .catch(() => {
                    emits('update:autoplayPolicy', {
                        show: true,
                        play: () => {
                            play();
                        },
                    });
                });
        });
    }
    else {
        emits('update:autoplayPolicy', {
            show: false,
            play: () => {}
        });
    }
};

const pause = () => {
    player.value.pause();
    emits('update:isPause', true);
};

const ended = () => {
    if (currentPlayIndex.value === playlist.value.length - 1) {
        playlist.value = getPlaylist();
        audio.value = playlist.value[0];
        currentPlayIndex.value = 0;
    }
    else {
        audio.value = playlist.value[currentPlayIndex.value + 1];
        currentPlayIndex.value ++;
    }
    play();
};

const timeupdate = ({ target }) => {
    emits('update-status', {
        name: audio.value.name,
        currentTime: target.currentTime,
        duration: target.duration,
    });
};

const changeProgressManually = value => {
	player.value.currentTime = player.value.duration * parseFloat(value);
}

// 由系统暂停，而非点击页面中的暂停按钮：比如点击 ubuntu 通知栏中的暂停
const pauseBySystem = () => {
    if (!props.isPause) {
        emits('update:isPause', true);
    }
}
const playBySystem = () => {
    if (props.isPause) {
        emits('update:isPause', false);
    }
}

watch(
    () => props.isPlayable,
    value => {
        value ? play() : pause();      
    }
);

defineExpose({
    changeProgressManually,
    pause,
    play,
});

onMounted(() => {
    playlist.value = getPlaylist();
    audio.value = playlist.value[0];
    play();
});

</script>