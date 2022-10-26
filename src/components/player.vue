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
                    ? playNonFixedAudio()
                    : pauseNonFixedAudio()
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
                    {{ currentAudioStatus.currentTime }} - {{ currentAudioStatus.duration }}
                </span>
            </p>

            <input
                type="range"
                name="progress"
                class="w-full rounded-0 m-0 p-0 outline-none"
                min="0"
                max="1"
                step="0.00001"
                :value.lazy="currentAudioStatus.progress"
                @change="changeProgressManually"
                :disabled="!pauseable">

        </div>

    </div>
    
    <!-- 非固定播音的播放器 -->
    <audio
        ref="player"
        @timeupdate="updateCurrentAudioStatus"
        @ended="finishNonFixedAudio">
        <source
            v-if="currentNonFixedAudio.url"
            type="audio/mpeg"
            :src="currentNonFixedAudio.url">
    </audio>

    <!-- 固定播音的播放器 -->
    <audio
        ref="speaker"
        @timeupdate="updateCurrentAudioStatus"
        @ended="finishFixedAudio">
        <source
            v-if="currentFixedAudio.url"
            type="audio/mpeg"
            :src="currentFixedAudio.url">
    </audio>

</template>

<script setup>

import { ref, shallowRef, computed, onBeforeMount, onMounted, onBeforeUnmount, nextTick, watchEffect } from 'vue';
import { getUnixtimeFromDatetime, getCurrentUnixtime, formatSeconds } from '~/utils/time.js';
import { randomIntFromInterval } from '~/utils/helpers.js';
import { useAuth } from '~/store/auth.js';
import axios from '~/plugins/axios.js';
import dayjs from 'dayjs';

// ------------------------------------- 当前门店信息 ---------------------------------------

const auth = useAuth();

// 是否处于营业时间
const isOpen = ref(false);

// 是否营业更新器，用于检查当前是否处于营业时间
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
let audiosUpdater = null;

const refreshAudios = async () => {
    let { data } = await axios.get('/audios');
    audios.value = data;
}

onMounted(() => {

    // 最晚每 5 分钟更新一次所有要播放的音频文件
    // 这里计划是 3 分钟，但是为了避免高并发，实际为 3 分钟 - 5 分钟之间的任意一毫秒

    let randomUpdateInterval = randomIntFromInterval(
        3 * 60 * 1000, // 3 分钟
        5 * 60 * 1000, // 5 分钟
    );

    audiosUpdater = setInterval(() => {
        refreshAudios();
    }, randomUpdateInterval);
});

onBeforeUnmount(() => {
    if (audiosUpdater) {
        clearInterval(audiosUpdater);
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

// 计算固定播音日程表
// @return {unixTimestamp: fixedAudio}
const getFixedAudiosSchedule = () => {
    
    let schedule = {};
    
    fixedAudios.value.forEach(audio => {
        let {
            between, // 播放间隔（分钟）
            play_at, // 开始播放时间
            count, // 要播放的次数
            duration, // 音频的实际时长（秒）
        } = audio;

        let realBetween = Math.max(between * 60, duration);

        for (let i = 0; i < count; i++) {
            let timestamp = getUnixtimeFromDatetime(play_at) + i * realBetween;
            schedule[timestamp] = audio;
        }
    });

    return schedule;
}

// ------------------------------------- 具体到播放的相关逻辑 -------------------------------------

// 固定播音拥有最高的优先级，如果有固定播音，就不会播放其他播音
// 固定播音不受营业时间限制，其他的音频会被营业时间限制
// 固定播音里面，当前播放的固定播音拥有最高的优先级：比如一个固定播音时长为 3 分钟，但是设置的时间间隔为 2 分钟，那么也会等这个固定播音播放完成后才会再次播放这个固定播音
// 这样做是为了保证固定播音会被完整得播放，对于这个固定播音而言，虽然设置的间隔时间为 2 分钟，但是实际的间隔时间为 3 分钟，就是说 实际间隔时间 = max(固定播音的音频时长, 设置的间隔时长)

// 固定播音为单独的一个 audio 标签
// 其他的播音（背景音乐+促销播音）共享另一个 audio 标签
// 固定播音播放时，其他播音会被暂停，等待固定播音播放完成后，再恢复播放其他播音
// 固定播音在 this.$refs.speaker 上播放
// 非固定播音在 this.$refs.player 上播放

// 其他播音都是按照顺序播完一个，再播下一个
// 固定播音是按照时间直接插入

// 完整的播放逻辑是：
// 用户打开登录之后，
// 1. 先从后端 （GET /api/audios） 获取到所有的播音数据 （audios）
//      这个获取所有播放列表的行为 （refreshAudios）会一直循环进行
// 2. 根据播音数据（audios），分类为 固定播音数据 （fixedAudios），背景音乐数据 （backgroundAudios），促销播音数据 （promoteAudios） 
// 3. 根据当前的时间，计算出当前的播放列表 （currentPlaylist）
//      当前的播放列表（currentPlaylist）仅包含背景音乐和当季促销播音
//      这个计算不是只进行一次，而是每次播放完 当前的播放列表（currentPlaylist）都会重新计算一次然后从第一首音频开始播放
//      原因是因为有些门店会好几天不关 electron 客户端，而且 所有的播放数据（audios）也是会定时更新的
//      但是这个实时性不强，比如说 音频 A 已经被从数据库里面删除了，但是还处在客户端当前播放列表还没有被播放的部分里面、那么 音频 A 也是会被播放的
// 4. 开始循环播放音频
//      播放分 2 种播放：
//      1. 播放非固定播音（playNonFixedAudios）
//      2. 播放固定播音（playFixedAudios）
//      播放的时候会有一个 timeChecker 用来检查当前是否应该播放固定播音

// ------------------------------------固定播音检查器------------------------------------

// 固定播音检查器的作用是检查当前是否应该播放固定播音

let shouldPlayFixedAudioChecker = null;

onMounted(() => {
    nextTick(() => {
        shouldPlayFixedAudioChecker = setInterval(() => {
            let currentUnixtime = getCurrentUnixtime(),
                fixedAudiosSchedule = getFixedAudiosSchedule();

            if (
                Object.keys(fixedAudiosSchedule).includes(currentUnixtime)
                && !isPlayingFixedAudio.value
            ) {
                playFixedAudio(
                    fixedAudiosSchedule[currentUnixtime]
                );
            }

        }, 1000)
    });
});

onBeforeUnmount(() => {
    if (shouldPlayFixedAudioChecker) {
        clearInterval(shouldPlayFixedAudioChecker);
    }
});


// ---------------------------------------播放逻辑---------------------------------------

const speaker = ref(null),
    player = ref(null);

const isPause = ref(true),
    isPlayingFixedAudio = ref(false);

const pauseable = computed(() => {
    return isOpen.value && !isPlayingFixedAudio.value;
});

// 固定音频
const currentFixedAudio = shallowRef({});

const playFixedAudio = audio => {
    
    currentFixedAudio.value = audio;

    isPlayingFixedAudio.value = true;
    
    pauseNonFixedAudio();

    nextTick(() => {
        setTimeout(() => {
            speaker.value.play();
        }, 0);
    });
}

const finishFixedAudio = () => {
    isPlayingFixedAudio.value = false;
    playNonFixedAudio();
}

// 非固定音频
const currentNonFixedAudio = shallowRef({});

const playNonFixedAudio = () => {
    if (
        !isPlayingFixedAudio.value
        && isOpen.value
    ) {
        nextTick(() => {
            setTimeout(() => {
                player.value
                    .play()
                    .then(() => {
                        isPause.value = false;
                    });
            }, 0);
        });
    }
}

const pauseNonFixedAudio = () => {
    nextTick(() => {
        setTimeout(() => {
            player.value
                .pause();
            isPause.value = true;
        }, 0);
    });
}

const finishNonFixedAudio = () => {

    let currentAudioIndex = currentPlaylist.value.findIndex(audio => audio.id === currentAudio.value.id);

    if (currentAudioIndex === currentPlaylist.value.length - 1) {
        refreshCurrentPlaylist();
        currentNonFixedAudio.value = currentPlaylist.value[0];
    }
    else {
        currentNonFixedAudio.value = currentPlaylist.value[currentAudioIndex + 1];
    }

    playNonFixedAudio();
}

// ------------------------------------音频信息显示--------------------------------------

// 音频信息
const currentAudio = computed(() => {
    return isPlayingFixedAudio.value
        ? currentFixedAudio.value
        : currentNonFixedAudio.value;
});

// 音频状态
const currentAudioStatus = ref({
    progress: 0,
    currentTime: '00:00',
    duration: '00:00',
});

const updateCurrentAudioStatus = ({ target }) => {
    if (target) {
        currentAudioStatus.value = {
            progress: (target.currentTime / target.duration).toFixed(2),
            currentTime: formatSeconds(target.currentTime.toFixed(0)),
            duration: formatSeconds(target.duration.toFixed(0)),
        }
    }
}

// 用户拖动进度条
const changeProgressManually = ({ target }) => {
    let { value } = target;
	player.value.currentTime = player.value.duration * parseFloat(value);
}

onBeforeMount(() => {
    refreshAudios()
        .then(() => {
            refreshCurrentPlaylist();
            currentNonFixedAudio.value = currentPlaylist.value[0];
            playNonFixedAudio();
        });
});


// 几个 setInterval 说明

// isOpenUpdater : 每 1 秒更新一次 isOpen （门店是否处于营业时间）
// audiosUpdater : 每 3 分钟更新一次 audios （所有要播放的音频文件，并不是播放列表）
//      这里计划是 3 分钟，但是为了避免高并发，实际上是一个 3 分钟 - 5 分钟的随机毫秒数
// shouldPlayFixedAudioChecker: 每 1 秒检查一次当前是否应该播放固定播音
// audiosHistoryRecorder: 每 10 分钟上传一次播放历史

watchEffect(() => {
    console.log(
        'isOpen:' + isOpen.value + '\n'
    )
});

</script>