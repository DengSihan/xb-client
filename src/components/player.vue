<template>

    <div
        id="player"
        class="h-24 px-6 border-t">

        player

    </div>

    <audio
        v-if="currentAudio.url"
        ref="player"
        @ended="finish"
        @timeupdate="updateAudioStatus"
        :src="currentAudio.url"/>

</template>

<script setup>

import { ref, shallowRef, computed, onBeforeMount, onBeforeUnmount } from 'vue';
import axios from '~/plugins/axios.js';

// 根据给定的时间戳（比如"09:00:00"）得出对应当日的 Unix 时间戳
const getUnixtimeFromDatetime = time => {
    let now = new Date(),
        today = Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate())).getTime() / 1000);
    return today + parseInt(time.split(':')[0]) * 60 * 60 + parseInt(time.split(':')[1]) * 60;
};

const playlist = shallowRef([]),
    isPaused = ref(false),
    playCounter = ref(1),
    currentAudio = ref({}),
    currentAudioDuration = ref(0),
    currentAudioProgress = ref(0),
    promotionPlayable = ref(false)

let timeChecker = null,
    playlistUpdater = null;

const backgroundPlaylist = computed(() => {
        return playlist.value.filter(audio => audio.category === 1);
    }),
    fixedPlaylist = computed(() => {
        return playlist.value.filter(audio => audio.category === 2);
    }),
    promotionPlaylist = computed(() => {
        return playlist.value.filter(audio => audio.category === 3);
    });


const refreshPalylist = async () => {
    let { data } = await axios.get('/playlist');
    playlist.value = data;
}

const finish = () => {
    
}

onBeforeMount(() => {
    refreshPalylist();
});

onBeforeUnmount(() => {

});

</script>