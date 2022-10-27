<template>
    <audio
        autoplay
        ref="player"
        :key="audio?.url"
        @timeupdate="timeupdate"
        @ended="ended"
        @pause="pauseBySystem">
        <source
            v-if="audio.url"
            type="audio/mpeg"
            :src="audio.url">
    </audio>
    <dialog-for-autoplay-policy
        @interact="play"
        v-model="preventByAutoplayPolicy"/>
</template>

<script setup>
import { ref, onBeforeUnmount, onMounted, nextTick, shallowRef } from 'vue';
import { getCurrentUnixtime, getUnixtimeFromDatetime } from '~/utils/time.js';
import DialogForAutoplayPolicy from '~/components/player/dialog-for-autoplay-policy.vue';

// ---------------计算逻辑，不涉及交互-----------------

const props = defineProps({
    audios: {
        required: true,
        type: Array,
    },
    isPlayingFixedAudios: {
        required: true,
        type: Boolean,
    },
});

const emits = defineEmits([
    'update:isPlayingFixedAudios',
    'statusupdate',
]);

// 计算固定播音日程表
// @return {unixTimestamp: fixedAudio}
const getAudiosSchedule = () => {
    
    let result = {};
    
    props.audios.forEach(audio => {

        let {
            between, // 播放间隔（分钟）
            play_at, // 开始播放时间
            count, // 要播放的次数
            duration, // 音频的实际时长（秒）
        } = audio;

        count = 100000

        let realBetween = Math.max(between * 60, duration) / 60;

        for (let i = 0; i < count; i++) {
            let timestamp = getUnixtimeFromDatetime(play_at) + i * realBetween;
            result[timestamp] = audio;
        }
    });

    return result;
}

// 轮询检查当前是否应该播放固定播音
let shouldPlayFixedAudioChecker = null;

onMounted(() => {
    nextTick(() => {
        shouldPlayFixedAudioChecker = setInterval(() => {

            let currentUnixtime = getCurrentUnixtime().toString(),
                sudiosSchedule = getAudiosSchedule();

            console.log(Object.keys(sudiosSchedule)[3] - currentUnixtime)

            if (
                Object.keys(sudiosSchedule).includes(currentUnixtime)
                && !props.isPlayingFixedAudio
            ) {

                console.log('play fixed audio')
                play(sudiosSchedule[currentUnixtime]);
            }

        }, 1000)
    });
});

onBeforeUnmount(() => {
    if (shouldPlayFixedAudioChecker) {
        clearInterval(shouldPlayFixedAudioChecker);
    }
});


// -----------------播放逻辑------------------------

const player = ref(null), // this.$refs.audio DOM 对象
    audio = ref({}), // 正在播放的音频
    preventByAutoplayPolicy = ref(false); // 是否被浏览器自动播放策略阻止自动播放

const play = audioNeedToPlay => {
    nextTick(() => {
        if (
            !props.isPlayingFixedAudios
        ) {
            audio.value = audioNeedToPlay;
            player.value
                .play()
                .then(() => {
                    preventByAutoplayPolicy.value = false;
                    emits('update:isPlayingFixedAudios', true);
                })
                .catch(() => {
                    preventByAutoplayPolicy.value = true;
                });
        }
    });
};

const timeupdate = ({ target }) => {
    emits('statusupdate', {
        name: audio.value.name,
        currentTime: target.currentTime,
        duration: target.duration,
    });
};

const pauseBySystem = e => {
    e.preventDefault();    
}

const ended = () => {
    emits('update:isPlayingFixedAudios', false);
};

</script>