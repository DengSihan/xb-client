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

Array.prototype.randomExpand = function(minLength) {

    let result = [...this];

    if (result.length < minLength) {

        result = [
            ...result,
            ...result.shuffle().slice(0, 1)
        ];

        return result.randomExpand(minLength);
    }
    else {
        return result;
    }
}
