import { ref, shallowRef, computed, onBeforeMount, onBeforeUnmount } from 'vue';
import { useAuth } from '~/store/auth.js';
import { getCurrentUnixtime, getUnixtimeFromDatetime, formatSeconds } from '~/utils/time.js';
import { randomIntFromInterval } from '~/utils/helpers.js';
import axios from '~/plugins/axios.js';
import dayjs from 'dayjs';

// 是否处于营业状态
export const useIsOpen = () => {

    const auth = useAuth();

    const isOpen = ref(false);

    const refreshIsOpen = () => {

        let currentUnixtime = getCurrentUnixtime(),
            open_at = auth.store.open_at,
            close_at = auth.store.close_at;
    
        isOpen.value = currentUnixtime >= getUnixtimeFromDatetime(open_at)
            && currentUnixtime <= getUnixtimeFromDatetime(close_at);
    };

    // 是否营业更新器，用于检查当前是否处于营业时间
    let isOpenUpdater = null;

    onBeforeMount(() => {
        refreshIsOpen();
        isOpenUpdater = setInterval(() => {
            refreshIsOpen();
        }, 1000);
    });

    onBeforeUnmount(() => {
        if (isOpenUpdater) {
            clearInterval(isOpenUpdater);
        }
    });

    return isOpen;
}


// 原始音频数据
export const useAudio = () => {

    const audios = shallowRef([]);

    const refreshAudios = async () => {
        const { data } = await axios.get('/audios');
        audios.value = data;
    };

    let audiosUpdater = null;

    onBeforeMount(async () => {
        
        await refreshAudios();

        audiosUpdater = setInterval(
            refreshAudios,
            // 5分钟 ~ 10分钟 之间一个任意的一个毫秒数，为了避免多个门店同时请求造成高并发
            randomIntFromInterval(
                1000 * 60 * 5, // 5 分钟
                1000 * 60 * 10 // 10 分钟
            )
        );
    });

    onBeforeUnmount(() => {
        if (audiosUpdater) {
            clearInterval(audiosUpdater);
        }
    });

    const fixedAudios = computed(() => {
        return audios.value.filter(({ category }) => category === 2);
    });

    const nonFixedAudios = computed(() => {
        return audios.value.filter(({ category }) => category !== 2);
    });

    return {
        audios,
        fixedAudios,
        nonFixedAudios,
    };
}

// 非固定音频计算逻辑
export const useNonFixedAudios = props => {

    const backgroundAudios = computed(() => {
        return props.audios.filter(({ category }) => category === 1);
    });

    const promoteAudios = computed(() => {
        return props.audios.filter(({ category }) => category === 3);
    });


    // // 得到的结果就是 currentPlaylist
    // // 播放完之后再重新计算

    // // 由于有些门店有可能几天都不关闭软件，所以当季的促销音频不能用 computed 获取，而是实时计算

    // 2025-05-18 23:50 
    // 新逻辑
    // 1. 先找到所有处于播放日期内的的促销音频 seasonalPromoteAudios
    // 2. 列出所有的背景音乐 backgroundAudios
    // 3. 遍历每一首 背景音乐 backgroundAudio[backgroundAudioIndex],
    //    每首背景音乐都需要遍历所有的 seasonalPromoteAudios
    //    如果 backgroundAudioIndex 正好是 seasonalPromoteAudios[seasonalPromoteAudiosIndex] 的 interval 的倍数
    //    那么就插入到 backgroundAudio[backgroundAudioIndex] 的后面
    // 4. 最后得到 currentPlaylist

    const getPlaylist = () => {
        
        let currentUnixtime = getCurrentUnixtime();
        
        // 1. 先找到所有处于播放日期内的的促销音频 seasonalPromoteAudios
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
            // 既没有 promote_start_date 又没有 promote_end_date
            else {
                return true;
            }
        });

        let result = [];

        // 2. 列出所有的背景音乐 backgroundAudios
        let shuffledBackgroundAudios = [...backgroundAudios.value.shuffle()];

        // 3. 遍历每一首 背景音乐 backgroundAudio[backgroundAudioIndex],
        // 注意：backgroundAudioIndex 是从 0 开始的
        shuffledBackgroundAudios.forEach((backgroundAudio, backgroundAudioIndex) => {
            result.push(backgroundAudio);

            // 4. 遍历每一首 促销音频 seasonalPromoteAudio[seasonalPromoteAudiosIndex]
            seasonalPromoteAudios.forEach((seasonalPromoteAudio) => {

                // 5. 如果 backgroundAudioIndex 正好是 seasonalPromoteAudio.interval 的倍数
                if ((backgroundAudioIndex + 1) % seasonalPromoteAudio.interval === 0) {
                    // 6. 那么就插入到 backgroundAudio[backgroundAudioIndex] 的后面
                    result.push(seasonalPromoteAudio);
                }
            });
        });

        return result;
    };

    return {
        getPlaylist,
    };
}

// 固定播音的计算逻辑
export const useFixedAudios = () => {

    const getSchedule = audios => {

        let result = {};

        audios.forEach(audio => {

            let {
                between, // 播放间隔（分钟）
                play_at, // 开始播放时间
                count, // 要播放的次数
                duration, // 音频的实际时长（秒）
            } = audio;

            let realBetween = Math.max(between * 60, duration);

            for (let i = 0; i < count; i++) {
                let timestamp = getUnixtimeFromDatetime(play_at) + i * realBetween;
                result[timestamp] = audio;
            }
        });

        return result;
    }

    return {
        getSchedule,
    }
}


export const useStatus = (isPlayingFixedAudios) => {

    // 更新显示
    const nonFixedAudiosStatus = ref({
        name: '加载中...',
        progress: 0,
        currentTime: '00:00',
        duration: '00:00',
    });
    const fixedAudiosStatus = ref({
        name: '加载中...',
        progress: 0,
        currentTime: '00:00',
        duration: '00:00',
    });

    const status = computed(() => {
        return isPlayingFixedAudios.value ? fixedAudiosStatus.value : nonFixedAudiosStatus.value;
    });

    // 类似浏览器 audio 原生事件 timeupdate，只用于状态字段的更新
    const updateStatus = ({ currentTime, duration, name }) => {

        let result = {
            name,
            progress: 0,
            currentTime: '00:00',
            duration: '00:00',
        };

        if (currentTime !== 0 && duration !== 0) {
            result = {
                name,
                progress: (currentTime / duration).toFixed(2),
                currentTime: formatSeconds(currentTime.toFixed(0)),
                duration: formatSeconds(duration.toFixed(0)),
            }
        }

        isPlayingFixedAudios.value
            ? fixedAudiosStatus.value = result
            : nonFixedAudiosStatus.value = result;
    }

    return {
        status,
        updateStatus,
    };
}

export const useHistory = () => {

    const timeCurrentAudioHasBeenPlayed = ref(0);

    const storeHistory = (audio) => {
        axios.post(`/histories`, {
            audio_id: audio.id, 
        });
    }

    return {
        timeCurrentAudioHasBeenPlayed,
        storeHistory
    };
}
