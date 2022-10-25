// 根据给定的时间戳（比如"09:00:00"）得出对应当日的 unix 时间戳
export const getUnixtimeFromDatetime = time => {
    let now = new Date(),
        today = Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate())).getTime() / 1000);
    return today + parseInt(time.split(':')[0]) * 60 * 60 + parseInt(time.split(':')[1]) * 60;
};

// 得到当前的 unix 时间戳
export const getCurrentUnixtime = () => {
    return Math.floor(new Date().getTime() / 1000);
}

// 格式化秒到人类可读
// 120 => 02:00
export const formatSeconds = (s = 0) => {
    let minutes = (s - ( s%60 ) ) / 60,
        second = s%60;
    return (minutes > 9 ? minutes : `0${minutes}`) + ':' + (second > 9 ? second : `0${second}`);
}