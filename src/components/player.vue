<template>

    <div
        id="player"
        class="h-24 px-6 border-t flex items-center justify-between">

        <button
            class="rounded-full btn h-12 w-12 text-white text-2xl shadow flex items-center justify-center"
            :class="{
                'bg-teal-600 hover:bg-teal-500 hover:scale-[102%] active:scale-[98%] scale-100 transition-[background,transform]': pauseable,
                'bg-slate-200 cursor-not-allowed': !pauseable
            }"
            type="button"
            @click="
                isPause
                    ? playNonFixedAudios()
                    : pauseNonFixedAudios()
            "
            :disabled="!pauseable"
            v-wave="pauseable">
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
                    class="w-[calc(100%-theme('space.24'))] truncate">
                    {{ currentAudio.name }}
                </span>
                <span
                    class="w-24 whitespace-nowrap font-mono text-right">
                    {{ currentAudioTimeString }} / {{ currentAudioDurationString }}
                </span>
            </p>

            <input
                type="range"
                name="progress"
                class="w-full rounded-0 m-0 p-0 outline-none"
                min="0"
                max="1"
                step="0.00001"
                :value.lazy="currentAudioProgress"
                @change="changeProgressManually"
                :disabled="!pauseable">

        </div>

    </div>
    
    <!-- 非固定播音的播放器 -->
    <audio
        ref="player"
        @timeupdate="updateCurrentAudioStatus"
        @ended="finishNonFixedAudioPlaying">
        <source
            v-if="currentNonFixedAudio.path"
            type="audio/mpeg"
            :src="currentNonFixedAudio.path">
    </audio>

    <!-- 固定播音的播放器 -->
    <audio
        ref="speaker"
        @timeupdate="updateCurrentAudioStatus"
        @ended="finishFixedAudioPlaying">
        <source
            v-if="currentFixedAudio.path"
            type="audio/mpeg"
            :src="currentFixedAudio.path">
    </audio>

</template>

<script setup>

// 固定播音拥有最高的优先级，如果有固定播音，就不会播放其他播音
// 固定播音不受营业时间限制，其他的音频会被营业时间限制
// 固定播音里面，当前播放的固定播音拥有最高的优先级：比如一个固定播音时长为 3 分钟，但是设置的时间间隔为 2 分钟，那么也会等这个固定播音播放完成后才会再次播放这个固定播音
// 这样做是为了保证固定播音会被完整得播放，对于这个固定播音而言，虽然设置的间隔时间为 2 分钟，但是实际的间隔时间为 3 分钟，就是说 实际间隔时间 = max(固定播音的音频时长, 设置的间隔时长)

// 固定播音为单独的一个 audio 标签
// 其他的播音（背景音乐+促销播音）共享另一个 audio 标签
// 固定播音播放时，其他播音会被暂停，等待固定播音播放完成后，再恢复播放其他播音

// 其他播音都是按照顺序播完一个，再播下一个
// 固定播音是按照时间直接插入

import { ref, shallowRef, computed, onBeforeMount, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { getUnixtimeFromDatetime, getCurrentUnixtime, formatSeconds } from '~/utils/time.js';
import { useAuth } from '~/store/auth.js';
import axios from '~/plugins/axios.js';
import dayjs from 'dayjs';

// ------------------------------------- 当前门店信息 ---------------------------------------

const auth = useAuth();

// 是否处于营业时间
const isOpen = ref(false);

let isOpenUpdater = null;

const refreshIsOpen = () => {

    let currentUnixtime = getCurrentUnixtime(),
        open_at = auth.store.open_at,
        close_at = auth.store.close_at;

    isOpen.value = currentUnixtime >= getUnixtimeFromDatetime(open_at)
        && currentUnixtime <= getUnixtimeFromDatetime(close_at);
}

onBeforeMount(() => {
    refreshIsOpen();
});

onMounted(() => {
    isOpenUpdater = setInterval(() => {
        refreshIsOpen();
    }, 1000);
});

onBeforeUnmount(() => {
    if (isOpenUpdater) {
        clearInterval(isOpenUpdater);
    }
});

// ------------------------------------- audios 相关逻辑 -------------------------------------

// 所有要播放的音频文件，并不是播放列表
const audios = shallowRef([]);
// 音频定时更新器
let audioUpdater = null;

const refreshAudios = async () => {
    let { data } = await axios.get('/audios');
    audios.value = data;
}

onMounted(() => {
    // 每 5 分钟更新一次音频列表
    audioUpdater = setInterval(() => {
        refreshAudios();
    }, 5 * 60 * 1000);
});

onBeforeUnmount(() => {
    if (audioUpdater) {
        clearInterval(audioUpdater);
    }
});

// ------------------------------------- playlist 相关逻辑 -------------------------------------

// 实际播放的 playlist 是由 audios 计算得出的

const backgroundAudios = computed(() => {
    return audios.value.filter(audio => audio.category === 1);
});
const fixedAudios = computed(() => {
    return audios.value.filter(audio => audio.category === 2);
});
const promoteAudios = computed(() => {
    return audios.value.filter(audio => audio.category === 3);
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

const currentPlaylist = shallowRef([]);

const refreshCurrentPlaylist = () => {

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

    let results = [];

    seasonalPromoteAudios.forEach(audio => {
        results = [
            ...results,
            ...backgroundAudios.value.randomExpand(audio.interval).shuffle(),
            audio,
        ];
    });
    
    // 如果当前没有促销播音，就播背景音乐
    if (results.length === 0) {
        results = backgroundAudios.value.shuffle();
    }

    currentPlaylist.value = results;
}

// ------------------------------------- 具体到播放的相关逻辑 -------------------------------------

// 固定播音在 speaker 上播放
// 非固定播音在 player 上播放
const speaker = ref(null),
    player = ref(null);

// 但是对于用户而言，只会看到一个播放器
// 暂停按钮只能暂停非固定播音，暂停对固定播音没有影响

const isPause = ref(true),
    isPlayingFixedAudio = ref(false);

const pauseable = computed(() => {
    return isOpen.value && !isPlayingFixedAudio.value;
});

const playNonFixedAudios = () => {
    if (
        !isPlayingFixedAudio.value
        && isOpen.value
    ) {
        nextTick(() => {
            setTimeout(() => {
                player.value.play()
                    .then(() => {
                        isPause.value = false;
                        currentAudioDurationString.value = formatSeconds(player.value.duration.toFixed(0));
                    });
            }, 0);
        });
    }
}

const pauseNonFixedAudios = () => {
    nextTick(() => {
        setTimeout(() => {
            player.value.pause();
            isPause.value = true;
        }, 0);
    });
}

const currentNonFixedAudio = shallowRef({}),
    currentFixedAudio = shallowRef({});

const currentAudio = computed(() => {
    return isPlayingFixedAudio.value
        ? currentFixedAudio.value
        : currentNonFixedAudio.value;
});


const finishFixedAudioPlaying = () => {

}

const finishNonFixedAudioPlaying = () => {
    let currentAudioIndex = currentPlaylist.value.findIndex(audio => audio.id === currentAudio.value.id);

    if (currentAudioIndex === currentPlaylist.value.length - 1) {
        refreshCurrentPlaylist();
        currentNonFixedAudio = currentPlaylist.value[0];
    }
    else {
        currentNonFixedAudio.value = currentPlaylist.value[currentAudioIndex + 1];
    }

    playNonFixedAudios();
}


// 当前正在播放的音频，仅用于显示
// 当前音频播到哪里了（比如 01：30）
const currentAudioTimeString = ref('');
// 当前音频的总时长（比如 03：00）
const currentAudioDurationString = ref('');
// 当前音频的播放进度（比如 0.5）
const currentAudioProgress = ref(0);

// 播音正在播放中
// 固定播音和非固定播音共用
// 因为显示是显示为一个播放器
const updateCurrentAudioStatus = ({ target }) => {
    if (target) {
        currentAudioProgress.value = (target.currentTime / target.duration).toFixed(2);
        currentAudioTimeString.value = formatSeconds(target.currentTime.toFixed(0));
    }
}


const changeProgressManually = ({ target }) => {
    let { value } = target;
	player.value.currentTime = player.value.duration * value;
}




// // 固定播音和非固定播音是在 2 个不同的 audio 标签上播放的
// // 非固定播音 -> player
// // 固定播音 -> speaker

// // 当前正在播放的非固定播音
// const currentAudio = shallowRef({});
// // 是否在播放固定播音
// const isPlayingFixedAudio = ref(false);
// // 当前正在播放的固定播音
// const currentFixedAudio = shallowRef({});



// // 播放非固定播音
// const playAudio = () => {
//     if (
//         !isPlayingFixedAudio.value
//     ) {
//         setTimeout(() => {
//             this.$refs.player.play()
//                 .then(() => {
//                     isPause.value = false;
//                     currentAudioDurationString.value = formatSeconds(this.$refs.player.duration.toFixed(0));
//                 });
//         });
//     }
// }

// // 暂停非固定播音
// const pauseAudio = () => {

// }

// // 播放固定播音
// const playFixedAudio = (audio) => {
//     currentFixedAudio.value = audio;
//     isPlayingFixedAudio.value = true;

//     pauseAudio();
// }



// // 非固定播音播放完成的回调
// const finishAudioPlaying = () => {
//     let currentAudioIndex = currentPlaylist.value.findIndex(audio => audio.id === currentAudio.value.id);

//     if (currentAudioIndex === currentPlaylist.value.length - 1) {
//         refreshCurrentPlaylist();
//         currentAudio = currentPlaylist.value[0];
//     }
//     else {
//         currentAudio.value = currentPlaylist.value[currentAudioIndex + 1];
//     }

//     playAudio();
// }

// // 固定播音完成播放
// const finishFixedAudioPlaying = () => {

// }



onBeforeMount(() => {
    refreshAudios()
        .then(() => {
            refreshCurrentPlaylist();
            currentNonFixedAudio.value = currentPlaylist.value[0];
            playNonFixedAudios();
        });
});

</script>