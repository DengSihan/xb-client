import { ref, shallowRef, computed, onBeforeMount, onBeforeUnmount, watchEffect } from 'vue';
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
            // 既没有 promote_start_date 又没有 promote_end_date
            else {
                return true;
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

    return {
        getPlaylist,
    };
}


export const useStatus = () => {

    // 更新显示
    const status = ref({
        name: '加载中...',
        progress: 0,
        currentTime: '00:00',
        duration: '00:00',
    });

    // 类似浏览器 audio 原生事件 timeupdate，只用于状态字段的更新
    const updateStatus = ({ currentTime, duration, name }) => {
        status.value = {
            name,
            progress: (currentTime / duration).toFixed(2),
            currentTime: formatSeconds(currentTime.toFixed(0)),
            duration: formatSeconds(duration.toFixed(0)),
        }
    }

    return {
        status,
        updateStatus,
    };
}
