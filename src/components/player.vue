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


const getUnixtimeFromDatetime = (datetime) => {
    return Math.floor(new Date(datetime).getTime() / 1000);
};

const playlist = shallowRef([]),
    isPaused = ref(false),
    playCounter = ref(1),
    currentAudio = ref({});

const backgroundPlaylist = computed(() => {
        return playlist.value.filter(audio => audio.category === 1);
    }),
    fixedPlaylist = computed(() => {
        return playlist.value.filter(audio => audio.category === 2);
    }),
    promotedPlaylist = computed(() => {
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