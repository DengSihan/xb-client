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

import { onMounted, shallowRef, nextTick } from 'vue';
import { useNonFixedAudios } from '~/composables/player.js';

const props = defineProps({
    audios: {
        type: Array,
        required: true,
    },
});

const playlist = shallowRef([]),
    audio = shallowRef({}),
    player = ref(null);

const {
    getPlaylist,
} = useNonFixedAudios(props);

onMounted(() => {
    playlist.value = getPlaylist();
    play(playlist.value[0]);
});

const play = a => {
    audio.value = a;
    nextTick(() => {

    })
};

const pause = () => {
    // player.value.pause();
};

const ended = () => {
    // player.value.pause();
};

const timeupdate = () => {
    // player.value.pause();
};
</script>