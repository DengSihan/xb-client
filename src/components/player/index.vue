<template>
     <div
        id="player"
        class="h-24 px-6 border-t flex items-center justify-between relative">

    </div>

    <non-fixed-audios-player
        v-if="nonFixedAudios.length"
        :audios="nonFixedAudios"/>

    <dialog-for-autoplay-policy
        v-model="showDialogForAutoplayPolicy"
        @interact="continuePlay"/>

</template>

<script setup>
import { ref } from 'vue';

import { useIsOpen, useAudio } from '~/composables/player.js';

import DialogForAutoplayPolicy from '~/components/player/dialog-for-autoplay-policy.vue';
import NonFixedAudiosPlayer from '~/components/player/non-fixed-audios-player.vue';

const isPause = ref(false);

// 是否处于营业时间
const isOpen = useIsOpen();

// 非固定音频与固定音频原始文件
const {
    nonFixedAudios,
    fixedAudios,
} = useAudio();

// 浏览器禁止自动播放
const showDialogForAutoplayPolicy = ref(false);

const continuePlay = () => {

}

</script>