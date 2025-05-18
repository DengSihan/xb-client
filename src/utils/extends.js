Array.prototype.shuffle = function() {

    let arr = [...this],
        currentIndex = arr.length,
        randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
    }

    return arr;
}

// 随机扩展数组
// 如果数组的长度小于希望的长度，那么会从现有 item 里面随机抓取作为新的 item 直至长度达到希望的长度
Array.prototype.randomExpand = function(minLength) {
    if (!Array.isArray(this) || this.length === 0 || minLength <= 0) {
        return [];
    }

    let result = [...this];
    
    while (result.length < minLength) {
        // 每次随机选择一个现有元素添加到结果中
        result.push(this[Math.floor(Math.random() * this.length)]);
    }

    return result;
}
