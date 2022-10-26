<template>
    <audio
        ref="player"
        :key="audio?.url"
        @timeupdate="timeupdate"
        @ended="finish">
        <source
            v-if="audio.url"
            type="audio/mpeg"
            :src="audio.url">
    </audio>
    <dialog-for-autoplay-policy
        v-model="preventByAutoplayPolicy"/>
</template>

<script setup>

import { ref, shallowRef, computed, onMounted, onBeforeMount, nextTick } from 'vue';
import { getCurrentUnixtime } from '~/utils/time.js';
import dayjs from 'dayjs';
import DialogForAutoplayPolicy from '~/components/player/dialog-for-autoplay-policy.vue';

const props = defineProps({
    audios: {
        required: true,
        type: Array,
    }
});

const emits = defineEmits([
    'timeupdate'
]);


// ---------------计算逻辑，不涉及交互-----------------

const playlist = shallowRef([]);

const backgroundAudios = computed(() => {
    return props.audios.filter(({ category }) => category === 1);
});

const promoteAudios = computed(() => {
    return props.audios.filter(({ category }) => category === 3);
});

// 非固定播音的播放逻辑是先算出哪些促销播音需要播放，再根据促销播音的播放间隔，插入随机的的背景音乐

// 比如 现在是 2022-10-01 10：00：00 日，有:
// 固定播音 A，B，C
// A 的间隔为 2 首，播放日期区间为 2022-10-01 ~ 2022-10-03 （具体的播放时间是 2022-10-01 00：00：00 至 2022-10-03 23：59：59）
// B 的间隔为 1 首，播放日期区间为 2022-09-01 ~ 2022-12-01
// C 的间隔为 4 首，播放日期区间为 2022-09-01 ~ 2022-09-30
// 背景音乐 甲，乙，丙，丁

// 计算的步骤为：
// 1. 先得出哪些是当季的促销播音（处于播音日期的促销播音）
// [A, B, C] => [A, B]
// 2. 再根据每个促销播音的间隔，插入随机的背景音乐
// 乙，丙      甲  <---随机从背景音乐中抽取
// |           |
// ⬇  ⬇ˉˉˉˉˉˉˉˉˉ
// [A, B]
// 3. 最后得到
// [乙，丙，A，甲，B]

// 得到的结果就是 currentPlaylist
// 播放完之后再重新计算

// 由于有些门店有可能几天都不关闭软件，所以当季的促销音频不能用 computed 获取，而是实时计算

const getPlaylist = () => {
    
    let currentUnixtime = getCurrentUnixtime();
    
    // 处于播放日期内的的促销音频
    let seasonalPromoteAudios = promoteAudios.value.filter(({
        promote_start_date,
        promote_end_date
    }) => {
        // 只有 promote_start_date（促销开始日期）
        if (
            !!promote_start_date
            && !promote_end_date
            && currentUnixtime >= dayjs(promote_start_date).unix()
        ) {
            return true;
        }
        // 只有 promote_end_date （促销结束日期）
        else if (
            !!promote_end_date
            && !promote_start_date
            && currentUnixtime < dayjs(promote_end_date).add(1, 'day').unix()
        ) {
            return true;
        }
        // 既有 promote_start_date 又有 promote_end_date
        else if (
            !!promote_start_date
            && !!promote_end_date
            && currentUnixtime >= dayjs(promote_start_date).unix()
            && currentUnixtime < dayjs(promote_end_date).add(1, 'day').unix()
        ) {
            return true;
        }
        else {
            return false;
        }
    });

    let result = [];

    seasonalPromoteAudios.forEach(audio => {
        result = [
            ...result,
            ...backgroundAudios.value.randomExpand(audio.interval).shuffle().slice(0, audio.interval),
            audio,
        ];
    });
    
    // 如果当前没有促销播音，就播背景音乐
    if (result.length === 0) {
        result = backgroundAudios.value.shuffle();
    }

    return result;
};

onBeforeMount(() => {
    playlist.value = getPlaylist();
});

// --------------------- 播放逻辑 ---------------------

const player = ref(null),
    audio = shallowRef({}),
    preventByAutoplayPolicy = ref(false);

const timeupdate = ({ target }) => {
    emits('timeupdate', target);
};

const play = () => {
    nextTick(() => {

        player.value
            .play()
            .catch(() => {
                preventByAutoplayPolicy.value = true;
            });
    });
}

const finish = () => {
    
};

const pause = () => {
    player.value.pause();
};

onMounted(() => {
    audio.value = playlist.value[0];
    play();
});







</script>